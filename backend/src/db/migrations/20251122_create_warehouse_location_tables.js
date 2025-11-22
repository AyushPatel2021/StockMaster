/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('warehouses', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('short_code').notNullable().unique();
            table.text('address');
            table.timestamps(true, true);
        })
        .createTable('locations', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('short_code').notNullable().unique();
            table.integer('warehouse_id').unsigned().notNullable()
                .references('id').inTable('warehouses').onDelete('CASCADE');
            table.timestamps(true, true);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('locations')
        .dropTableIfExists('warehouses');
};
