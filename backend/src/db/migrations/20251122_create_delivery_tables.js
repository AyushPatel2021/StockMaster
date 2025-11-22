/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('deliveries', function (table) {
            table.increments('id').primary();
            table.string('reference').notNullable().unique(); // WH/OUT/0001
            table.integer('contact_id').unsigned().references('id').inTable('contacts').onDelete('SET NULL');
            table.integer('location_id').unsigned().notNullable().references('id').inTable('locations');
            table.date('scheduled_date');
            table.string('status').defaultTo('draft'); // draft, ready, done
            table.timestamps(true, true);
        })
        .createTable('delivery_lines', function (table) {
            table.increments('id').primary();
            table.integer('delivery_id').unsigned().notNullable().references('id').inTable('deliveries').onDelete('CASCADE');
            table.integer('product_id').unsigned().notNullable().references('id').inTable('products');
            table.integer('quantity').notNullable().defaultTo(0); // Ordered quantity
            table.integer('done_quantity').defaultTo(0); // Delivered quantity
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('delivery_lines')
        .dropTableIfExists('deliveries');
};
