
import { BaseService } from './base-service'

export class SalesVisitService extends BaseService {
    private static ENDPOINT = "/sales-visits"

    static async getVisits(params?: any) {
        try {
            return await this.getCollection<any>(this.ENDPOINT, params)
        } catch (error) {
            return this.handleError(error)
        }
    }

    static async getVisit(id: number | string) {
        try {
            return await this.getSingle<any>(`${this.ENDPOINT}/${id}`)
        } catch (error) {
            return this.handleError(error)
        }
    }

    static async createVisit(data: any) {
        try {
            return await this.post<any>(this.ENDPOINT, data)
        } catch (error) {
            return this.handleError(error)
        }
    }

    static async updateVisit(id: number | string, data: any) {
        try {
            return await this.put<any>(`${this.ENDPOINT}/${id}`, data)
        } catch (error) {
            return this.handleError(error)
        }
    }

    static async deleteVisit(id: number | string) {
        try {
            return await this.delete(`${this.ENDPOINT}/${id}`)
        } catch (error) {
            return this.handleError(error)
        }
    }
}
