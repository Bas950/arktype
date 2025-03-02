import {
	domainDescriptions,
	domainOf,
	printable,
	prototypeKeysOf,
	type Domain,
	type JsonPrimitive,
	type Key,
	type array
} from "@ark/util"
import type { BaseMeta, declareNode } from "../shared/declare.js"
import { Disjoint } from "../shared/disjoint.js"
import {
	defaultValueSerializer,
	implementNode,
	type nodeImplementationOf
} from "../shared/implement.js"
import type { TraverseAllows } from "../shared/traversal.js"
import { RawBasis } from "./basis.js"
import { defineRightwardIntersections } from "./utils.js"

export type UnitSchema<value = unknown> = UnitInner<value>

export interface UnitInner<value = unknown> extends BaseMeta {
	readonly unit: value
}

export interface UnitDeclaration
	extends declareNode<{
		kind: "unit"
		schema: UnitSchema
		normalizedSchema: UnitSchema
		inner: UnitInner
		errorContext: UnitInner
	}> {}

export const unitImplementation: nodeImplementationOf<UnitDeclaration> =
	implementNode<UnitDeclaration>({
		kind: "unit",
		hasAssociatedError: true,
		keys: {
			unit: {
				preserveUndefined: true,
				serialize: schema =>
					schema instanceof Date ?
						schema.toISOString()
					:	defaultValueSerializer(schema)
			}
		},
		normalize: schema => schema,
		defaults: {
			description: node => printable(node.unit),
			problem: ({ expected, actual }) =>
				`${expected === actual ? `must be reference equal to ${expected} (serialized to the same value)` : `must be ${expected} (was ${actual})`}`
		},
		intersections: {
			unit: (l, r) => Disjoint.init("unit", l, r),
			...defineRightwardIntersections("unit", (l, r) =>
				r.allows(l.unit) ? l : (
					Disjoint.init(
						"assignability",
						l,
						r.hasKind("intersection") ?
							r.children.find(
								rConstraint => !rConstraint.allows(l.unit as never)
							)!
						:	r
					)
				)
			)
		}
	})

export class UnitNode extends RawBasis<UnitDeclaration> {
	compiledValue: JsonPrimitive = (this.json as any).unit
	serializedValue: JsonPrimitive =
		typeof this.unit === "string" || this.unit instanceof Date ?
			JSON.stringify(this.compiledValue)
		:	this.compiledValue
	literalKeys: array<Key> = prototypeKeysOf(this.unit)

	compiledCondition: string = compileEqualityCheck(
		this.unit,
		this.serializedValue
	)
	compiledNegation: string = compileEqualityCheck(
		this.unit,
		this.serializedValue,
		"negated"
	)
	expression: string = printable(this.unit)
	domain: Domain = domainOf(this.unit)
	get shortDescription(): string {
		return this.domain === "object" ?
				domainDescriptions.object
			:	this.description
	}

	traverseAllows: TraverseAllows =
		this.unit instanceof Date ?
			data => data instanceof Date && data.toISOString() === this.compiledValue
		:	data => data === this.unit
}

const compileEqualityCheck = (
	unit: unknown,
	serializedValue: JsonPrimitive,
	negated?: "negated"
) => {
	if (unit instanceof Date) {
		const condition = `data instanceof Date && data.toISOString() === ${serializedValue}`
		return negated ? `!(${condition})` : condition
	}
	return `data ${negated ? "!" : "="}== ${serializedValue}`
}
