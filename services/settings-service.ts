import { BaseService } from './base-service';

export class SettingsService extends BaseService {
    // Sources
    static async getSources() {
        return this.getCollection('/settings/sources');
    }

    static async createSource(data: { name: string }) {
        return this.post('/settings/sources', data);
    }

    static async updateSource(id: number | string, data: { name: string }) {
        return this.put(`/settings/sources/${id}`, data);
    }

    // Types
    static async getTypes() {
        return this.getCollection('/settings/types');
    }

    static async createType(data: { name: string }) {
        return this.post('/settings/types', data);
    }

    static async updateType(id: number | string, data: { name: string }) {
        return this.put(`/settings/types/${id}`, data);
    }

    // Pipelines
    static async getPipelines() {
        return this.getCollection('/settings/pipelines');
    }

    static async createPipeline(data: any) {
        return this.post('/settings/pipelines', data);
    }

    static async updatePipeline(id: number | string, data: any) {
        return this.put(`/settings/pipelines/${id}`, data);
    }

    // Users
    static async getUsers() {
        return this.getCollection('/settings/users');
    }

    static async createUser(data: any) {
        return this.post('/settings/users', data);
    }

    static async updateUser(id: number | string, data: any) {
        return this.put(`/settings/users/${id}`, data);
    }

    static async deleteUser(id: number | string) {
        return this.delete(`/settings/users/${id}`);
    }

    // Roles
    static async getRoles() {
        return this.getCollection('/settings/roles');
    }

    static async getPermissions() {
        return this.getCollection('/settings/roles/permissions');
    }

    static async createRole(data: any) {
        return this.post('/settings/roles', data);
    }

    static async updateRole(id: number | string, data: any) {
        return this.put(`/settings/roles/${id}`, data);
    }

    static async deleteRole(id: number | string) {
        return this.delete(`/settings/roles/${id}`);
    }

    // Groups
    static async getGroups() {
        return this.getCollection('/settings/groups');
    }

    static async createGroup(data: any) {
        return this.post('/settings/groups', data);
    }

    static async updateGroup(id: number | string, data: any) {
        return this.put(`/settings/groups/${id}`, data);
    }

    static async deleteGroup(id: number | string) {
        return this.delete(`/settings/groups/${id}`);
    }

    // Stages
    static async getStages(pipelineId?: number | string) {
        if (pipelineId) {
            return this.getSingle(`/settings/pipelines/${pipelineId}`, { include: 'stages' } as any);
        }
        return this.getCollection('/settings/attributes/lookup/stages');
    }
}
