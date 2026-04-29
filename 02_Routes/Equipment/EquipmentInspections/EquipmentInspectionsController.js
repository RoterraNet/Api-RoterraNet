const express = require('express');
const knex = require('../../../01_Database/connection');

const {
	getEquipmentInspectionSchemasDB,
	getEquipmentDB,
	postEquipmentInspectionsDB,
	getEquipmentInspectionsDB,
} = require('../../../01_Database/database');

const getEquipmentInspectionTable = async (req, res) => {
	try {
		const { globalFilter, start, size } = req.query;
		const paginatedTable = await knex(getEquipmentInspectionsDB)
			.leftJoin(
				getEquipmentDB,
				`${getEquipmentDB}.equipment_id`,
				`${getEquipmentInspectionsDB}.equipment_id`
			)
			.select(
				`${getEquipmentInspectionsDB}.*`,
				`${getEquipmentDB}.unit_number`,
				`${getEquipmentDB}.asset_type`
			)
			.modify((builder) => {
				if (globalFilter) {
					builder.whereRaw(
						`
        ${getEquipmentInspectionsDB}.answers::text ILIKE ?
        OR ${getEquipmentDB}.unit_number ILIKE ?
        OR ${getEquipmentDB}.asset_type ILIKE ?
        `,
						[`%${globalFilter}%`, `%${globalFilter}%`, `%${globalFilter}%`]
					);
				}
			})
			.orderBy(`${getEquipmentInspectionsDB}.created_on`, 'desc')
			.paginate({
				perPage: size || 10,
				currentPage: start || 1,
				isLengthAware: true,
			});

		const schemas = await knex(getEquipmentInspectionSchemasDB).where({ deleted: false });

		const schemaMap = Object.fromEntries(
			schemas.map((s) => [
				`${s.equipment_type}`,
				{
					equipmentType: s.equipment_type,
					version: s.version,
					sections: s.schema,
				},
			])
		);

		const enriched = paginatedTable.data.map((row) => {
			const schema = schemaMap[`${row.equipment_type}`];
			const schemaWithFails = normalizeSchemaWithFailConditions(schema);
			const result = equipmentEvaluateInspection(schemaWithFails, row.answers);

			return {
				...row,
				schema: schemaWithFails,
				result,
			};
		});

		res.json({
			...paginatedTable,
			data: enriched,
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			message: 'Error updating information',
			color: 'error',
			error: error,
		});
	}
};

const getEquipmentInspectionSchemas = async (req, res) => {
	try {
		const getSchemas = await knex(getEquipmentInspectionSchemasDB)
			.select('*')
			.where({ deleted: false });

		const schemaMap = Object.fromEntries(
			getSchemas.map((row) => [
				`${row.equipment_type}`,
				{
					equipmentType: row.equipment_type,
					version: row.version,
					sections: row.schema,
				},
			])
		);

		res.status(200).json(schemaMap);
	} catch (e) {
		res.status(500).json({ message: 'Error updating information', color: 'error', error: e });
		console.log(e);
	}
};

const getShopEquipment = async (req, res) => {
	try {
		const getEquipment = await knex(getEquipmentDB)
			.select(
				'equipment_id as id',
				'unit_number',
				'equipment_type_name as asset_type',

				knex.raw(`
					EXISTS (
						SELECT 1
						FROM ${getEquipmentInspectionsDB} i
						WHERE i.equipment_id = ${getEquipmentDB}.equipment_id
						AND DATE(i.created_on) = CURRENT_DATE
					) as inspected_today
				`),
				knex.raw(`
					(
						SELECT MAX(i.created_on)
						FROM ${getEquipmentInspectionsDB} i
						WHERE i.equipment_id = ${getEquipmentDB}.equipment_id
					) as last_inspection_date
				`)
			)
			.where({ shop_equipment: true })
			.orderBy('asset_type', 'unit_number');

		res.status(200).json(getEquipment);
	} catch (e) {
		console.log(e);
		res.status(500).json({
			message: 'Error updating information',
			color: 'error',
			error: e,
		});
	}
};

const postEquipmentInspection = async (req, res) => {
	const { equipment_id, equipment_type, schema_version, answers, created_by } = req.body;
	try {
		const [inspection] = await knex(postEquipmentInspectionsDB)
			.insert({
				equipment_id,
				equipment_type,
				schema_version,
				answers,
				created_by,
			})

			.returning('*');

		console.log(inspection);

		res.status(200).json(inspection);
	} catch (e) {
		res.status(500).json({ message: 'Error updating information', color: 'error', error: e });
		console.log(e);
	}
};

function equipmentEvaluateInspection(schema, answers) {
	if (!schema) return { status: 'unknown', failedQuestions: [] };

	const failed = [];

	schema.sections.forEach((section) => {
		section.questions.forEach((q) => {
			if (!q.failCondition) return;

			const value = answers[q.id];

			const { operator, value: failValue } = q.failCondition;

			let isFail = false;

			switch (operator) {
				case 'equals':
					isFail = value === failValue;
					break;
				case 'not_equals':
					isFail = value !== failValue;
					break;
				case 'greater_than':
					isFail = value > failValue;
					break;
				case 'less_than':
					isFail = value < failValue;
					break;
				default:
					break;
			}

			if (isFail) {
				failed.push(q.id);
			}
		});
	});

	return {
		status: failed.length ? 'FAILED' : 'Passed',
		failedQuestions: failed,
	};
}

function normalizeSchemaWithFailConditions(schema) {
	return {
		...schema,
		sections: schema.sections.map((section) => ({
			...section,
			questions: section.questions.map((q) => {
				if (q.failCondition) return q;

				if (q.type === 'boolean') {
					return {
						...q,
						failCondition: {
							operator: 'equals',
							value: 'Failed',
						},
					};
				}

				return q;
			}),
		})),
	};
}

module.exports = {
	getEquipmentInspectionSchemas,
	getShopEquipment,
	getEquipmentInspectionTable,
	postEquipmentInspection,
};
