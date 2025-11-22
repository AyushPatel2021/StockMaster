/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema
        .createTable('contacts', function (table) {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.string('type').defaultTo('vendor'); // vendor, customer
            table.string('email');
            table.string('phone');
            table.timestamps(true, true);
        })
        .createTable('receipts', function (table) {
            table.increments('id').primary();
            table.string('reference').notNullable().unique(); // WH/IN/0001
            table.integer('contact_id').unsigned().references('id').inTable('contacts').onDelete('SET NULL');
            table.integer('location_id').unsigned().notNullable().references('id').inTable('locations');
            table.date('scheduled_date');
            table.string('status').defaultTo('draft'); // draft, ready, done
            table.timestamps(true, true);
        })
        .createTable('receipt_lines', function (table) {
            table.increments('id').primary();
            table.integer('receipt_id').unsigned().notNullable().references('id').inTable('receipts').onDelete('CASCADE');
            table.integer('product_id').unsigned().notNullable().references('id').inTable('products');
            table.integer('quantity').notNullable().defaultTo(0); // Ordered quantity
            table.integer('done_quantity').defaultTo(0); // Received quantity
        })
        .table('inventory', function (table) {
            table.integer('free_to_use').defaultTo(0);
        });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema
        .table('inventory', function (table) {
            table.dropColumn('free_to_use');
        })
        .dropTableIfExists('receipt_lines')
        .dropTableIfExists('receipts')
        .dropTableIfExists('contacts');
};
