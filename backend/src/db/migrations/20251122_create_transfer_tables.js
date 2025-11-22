/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('transfers', function (table) {
            table.increments('id').primary();
            table.string('reference').notNullable().unique(); // WH/INT/0001
            table.integer('source_location_id').unsigned().notNullable().references('id').inTable('locations');
            table.integer('dest_location_id').unsigned().notNullable().references('id').inTable('locations');
            table.date('scheduled_date');
            table.string('status').defaultTo('draft'); // draft, ready, done
            table.timestamps(true, true);
        })
        .createTable('transfer_lines', function (table) {
            table.increments('id').primary();
            table.integer('transfer_id').unsigned().notNullable().references('id').inTable('transfers').onDelete('CASCADE');
            table.integer('product_id').unsigned().notNullable().references('id').inTable('products');
            table.integer('quantity').notNullable().defaultTo(0); // Ordered quantity
            table.integer('done_quantity').defaultTo(0); // Moved quantity
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('transfer_lines')
        .dropTableIfExists('transfers');
};
