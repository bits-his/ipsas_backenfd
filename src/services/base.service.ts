import type { Model, FindOptions, CreateOptions, DestroyOptions, Transaction } from "sequelize"
import type { PaginationOptions, PaginationResult } from "../types/common.types"

export abstract class BaseService<T extends Model, CreateAttrs = any, UpdateAttrs = any> {
  constructor(protected model: any) {}

  async findAll(options?: FindOptions): Promise<T[]> {
    return await this.model.findAll(options)
  }

  async findById(id: string, options?: FindOptions): Promise<T | null> {
    return await this.model.findByPk(id, options)
  }

  async findOne(options: FindOptions): Promise<T | null> {
    return await this.model.findOne(options)
  }

  async create(data: CreateAttrs, options?: CreateOptions): Promise<T> {
    return await this.model.create(data, options)
  }

  async update(id: string, data: UpdateAttrs, options?: { transaction?: Transaction }): Promise<[number, T[]]> {
    return await this.model.update(data, {
      where: { id },
      returning: true,
      ...options,
    })
  }

  async delete(id: string, options?: DestroyOptions): Promise<number> {
    return await this.model.destroy({
      where: { id },
      ...options,
    })
  }

  async paginate(paginationOptions: PaginationOptions, findOptions?: FindOptions): Promise<PaginationResult<T>> {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "DESC" } = paginationOptions
    const offset = (page - 1) * limit

    const options: FindOptions = {
      ...findOptions,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    }

    const { count, rows } = await this.model.findAndCountAll(options)

    const totalPages = Math.ceil(count / limit)

    return {
      data: rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: count,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    }
  }

  async count(options?: FindOptions): Promise<number> {
    return await this.model.count(options)
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.count({ where: { id } })
    return count > 0
  }
}
