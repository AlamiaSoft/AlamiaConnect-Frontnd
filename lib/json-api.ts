export interface JsonApiResource {
    id: string;
    type: string;
    attributes: Record<string, any>;
    relationships?: Record<string, { data: { type: string; id: string } | { type: string; id: string }[] | null }>;
}

export interface JsonApiResponse<T = JsonApiResource | JsonApiResource[]> {
    data: T;
    meta?: Record<string, any>;
    links?: Record<string, any>;
    included?: JsonApiResource[];
}

export function deserialize<T = any>(response: any): T {
    if (!response) return null as unknown as T;

    // Helper to map relationships to actual objects if included, or just IDs
    const flatten = (resource: any): any => {
        if (!resource) return null;

        // If it's wrapped in another "data" property (happens with some Laravel resources in collections)
        if (resource.data && !resource.attributes && !resource.id) {
            return flatten(resource.data);
        }

        // If it's already flat (no attributes property but has other properties)
        if (!resource.attributes && resource.id) {
            return resource;
        }

        const { id, type, attributes, relationships } = resource;
        const result: any = { id, type, ...attributes };

        if (relationships) {
            Object.keys(relationships).forEach(key => {
                if (!relationships[key]) return;
                const relData = relationships[key].data;

                if (!relData) {
                    result[key] = null;
                    return;
                }

                if (Array.isArray(relData)) {
                    // Has many
                    result[key] = relData.map((r) => {
                        const found = included.find((i) => i.type === r.type && i.id === r.id);
                        return found ? flatten(found) : { id: r.id, type: r.type };
                    });
                } else {
                    // Belongs to
                    const found = included.find((i) => i.type === relData.type && i.id === relData.id);
                    result[key] = found ? flatten(found) : { id: relData.id, type: relData.type };
                }
            });
        }
        return result;
    };

    // Determine if we're dealing with a wrapped JSON:API response or a plain one
    let data: any = response.data !== undefined ? response.data : response;
    const included = response.included || [];

    if (Array.isArray(data)) {
        return data.map(flatten) as unknown as T;
    } else if (data) {
        return flatten(data) as unknown as T;
    }
    return null as unknown as T;
}
