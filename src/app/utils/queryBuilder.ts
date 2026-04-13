// src/app/builder/QueryBuilder.ts

import {
  IQueryConfig,
  IQueryParams,
  IQueryResult,
  PrismaCountArgs,
  PrismaFindManyArgs,
  PrismaModelDelegate,
  PrismaNumberFilter,
  PrismaStringFilter,
  PrismaWhereConditions,
} from '../interfaces/query.interface';

// T = Model Type
export class QueryBuilder<
  T,
  TWhereInput = Record<string, unknown>,
  TInclude = Record<string, unknown>,
> {
  private query: PrismaFindManyArgs;
  private countQuery: PrismaCountArgs;
  private page: number = 1;
  private limit: number = 10;
  private skip: number = 0;
  private sortBy: string = 'createdAt';
  private sortOrder: 'asc' | 'desc' = 'desc';
  private selectFields: Record<string, boolean> | undefined;

  constructor(
    private model: PrismaModelDelegate,
    private queryParams: IQueryParams,
    private config: IQueryConfig = {}
  ) {
    this.query = {
      where: {},
      include: {},
      orderBy: {},
      skip: 0,
      take: 10,
    };

    this.countQuery = {
      where: {},
    };
  }

  search(): this {
    const { searchTerm } = this.queryParams;
    const { searchableFields } = this.config;

    if (searchTerm && searchableFields && searchableFields.length > 0) {
      const searchConditions: Record<string, unknown>[] = searchableFields.map((field) => {
        if (field.includes('.')) {
          const parts = field.split('.');

          if (parts.length === 2) {
            // 👉 FIXED: Explicit tuple typing
            const [relation, nestedField] = parts as [string, string];
            const stringFilter: PrismaStringFilter = {
              contains: searchTerm,
              mode: 'insensitive' as const,
            };
            return {
              [relation]: {
                [nestedField]: stringFilter,
              },
            };
          } else if (parts.length === 3) {
            // 👉 FIXED: Explicit tuple typing
            const [relation, nestedRelation, nestedField] = parts as [string, string, string];
            const stringFilter: PrismaStringFilter = {
              contains: searchTerm,
              mode: 'insensitive' as const,
            };
            return {
              [relation]: {
                some: {
                  [nestedRelation]: {
                    [nestedField]: stringFilter,
                  },
                },
              },
            };
          }
        }

        // direct field
        const stringFilter: PrismaStringFilter = {
          contains: searchTerm,
          mode: 'insensitive' as const,
        };
        return {
          [field]: stringFilter,
        };
      });

      const whereConditions = this.query.where as PrismaWhereConditions;
      whereConditions.OR = searchConditions;

      const countWhereConditions = this.countQuery.where as PrismaWhereConditions;
      countWhereConditions.OR = searchConditions;
    }

    return this;
  }

  filter(): this {
    const { filterableFields } = this.config;
    const excludedField = [
      'searchTerm',
      'page',
      'limit',
      'sortBy',
      'sortOrder',
      'fields',
      'include',
    ];

    const filterParams: Record<string, unknown> = {};

    Object.keys(this.queryParams).forEach((key) => {
      if (!excludedField.includes(key)) {
        filterParams[key] = this.queryParams[key];
      }
    });

    const queryWhere = this.query.where as Record<string, unknown>;
    const countQueryWhere = this.countQuery.where as Record<string, unknown>;

    Object.keys(filterParams).forEach((key) => {
      const value = filterParams[key];

      if (value === undefined || value === '') {
        return;
      }

      const isAllowedField =
        !filterableFields || filterableFields.length === 0 || filterableFields.includes(key);

      if (key.includes('.')) {
        const parts = key.split('.');

        if (filterableFields && !filterableFields.includes(key)) {
          return;
        }

        if (parts.length === 2) {
          // 👉 FIXED: Explicit tuple typing for computed properties
          const [relation, nestedField] = parts as [string, string];

          if (!queryWhere[relation]) {
            queryWhere[relation] = {};
            countQueryWhere[relation] = {};
          }

          const queryRelation = queryWhere[relation] as Record<string, unknown>;
          const countRelation = countQueryWhere[relation] as Record<string, unknown>;

          queryRelation[nestedField] = this.parseFilterValue(value);
          countRelation[nestedField] = this.parseFilterValue(value);
          return;
        }
      }
      if (!isAllowedField) {
        return;
      }

      // Range filter parsing (e.g. courseFee[lt]=5000)
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        queryWhere[key] = this.parseRangeFilter(value as Record<string, string | number>);
        countQueryWhere[key] = this.parseRangeFilter(value as Record<string, string | number>);
        return;
      }

      // direct value parsing
      queryWhere[key] = this.parseFilterValue(value);
      countQueryWhere[key] = this.parseFilterValue(value);
    });
    return this;
  }

  paginate(): this {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;

    this.page = page;
    this.limit = limit;
    this.skip = (page - 1) * limit;

    this.query.skip = this.skip;
    this.query.take = this.limit;

    return this;
  }

  sort(): this {
    const sortBy = this.queryParams.sortBy || 'createdAt';
    const sortOrder = this.queryParams.sortOrder === 'asc' ? 'asc' : 'desc';

    this.sortBy = sortBy;
    this.sortOrder = sortOrder;

    if (sortBy.includes('.')) {
      const parts = sortBy.split('.');

      if (parts.length === 2) {
        // 👉 FIXED: Explicit tuple typing
        const [relation, nestedField] = parts as [string, string];
        this.query.orderBy = {
          [relation]: {
            [nestedField]: sortOrder,
          },
        };
      }
    } else {
      this.query.orderBy = {
        [sortBy]: sortOrder,
      };
    }
    return this;
  }

  include(relation: TInclude): this {
    if (this.selectFields) return this;
    this.query.include = {
      ...(this.query.include as Record<string, unknown>),
      ...(relation as Record<string, unknown>),
    };
    return this;
  }

  async execute(): Promise<IQueryResult<T>> {
    const [total, data] = await Promise.all([
      this.model.count(this.countQuery as Parameters<typeof this.model.count>[0]),
      this.model.findMany(this.query as Parameters<typeof this.model.findMany>[0]),
    ]);

    const totalPages = Math.ceil(total / this.limit);

    return {
      data: data as T[],
      meta: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages,
      },
    };
  }

  private parseFilterValue(value: unknown): unknown {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'string' && !isNaN(Number(value)) && value != '') return Number(value);
    if (Array.isArray(value)) return { in: value.map((item) => this.parseFilterValue(item)) };
    return value;
  }

  private parseRangeFilter(
    value: Record<string, string | number>
  ): PrismaNumberFilter | PrismaStringFilter | Record<string, unknown> {
    const rangeQuery: Record<string, string | number | (string | number)[]> = {};

    Object.keys(value).forEach((operator) => {
      // 👉 FIXED: Assert that the value is definitely a string or number, never undefined
      const operatorValue = value[operator] as string | number;

      const parsedValue: string | number =
        typeof operatorValue === 'string' && !isNaN(Number(operatorValue))
          ? Number(operatorValue)
          : operatorValue;

      switch (operator) {
        case 'lt':
        case 'lte':
        case 'gt':
        case 'gte':
        case 'equals':
        case 'contains':
          rangeQuery[operator] = parsedValue;
          break;
        case 'in':
          rangeQuery[operator] = Array.isArray(operatorValue) ? operatorValue : [parsedValue];
          break;
      }
    });
    return Object.keys(rangeQuery).length > 0 ? rangeQuery : value;
  }
}
