import { EntitySchema, TableOptions, TableColumnOptions } from "typeorm";

export function convertSchemaColumnOptionsToTableColumnOptions(
  schema: EntitySchema
): TableOptions {
  const columns: TableOptions["columns"] = [];
  for (const key in schema.options.columns) {
    // eslint-disable-next-line no-prototype-builtins
    if (schema.options.columns.hasOwnProperty(key)) {
      const element = schema.options.columns[key] as TableColumnOptions;
      if (element !== undefined) {
        element.name = element.name ?? key;
        columns.push(element);
      }
    }
  }
  const tableOptions = Object.assign(schema.options) as TableOptions;
  tableOptions.columns = columns;
  return tableOptions;
}
