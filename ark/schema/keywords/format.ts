import type { RootModule, SchemaModule } from "../module.js"
import type { Out } from "../roots/morph.js"
import { defineRoot, schemaScope } from "../scope.js"

const normalizeNFC = defineRoot({
	in: "string",
	morphs: (s: string) => s.normalize("NFC")
})

const normalizeNFD = defineRoot({
	in: "string",
	morphs: (s: string) => s.normalize("NFD")
})

const normalizeNFKC = defineRoot({
	in: "string",
	morphs: (s: string) => s.normalize("NFKC")
})

const normalizeNFKD = defineRoot({
	in: "string",
	morphs: (s: string) => s.normalize("NFKD")
})

export type normalizationExports = {
	nfc: (In: string) => Out<string>
	nfd: (In: string) => Out<string>
	nfkc: (In: string) => Out<string>
	nfkd: (In: string) => Out<string>
}

export type normalization = SchemaModule<normalizationExports>

export const normalization: normalization = schemaScope({
	nfc: normalizeNFC,
	nfd: normalizeNFD,
	nfkc: normalizeNFKC,
	nfkd: normalizeNFKD
}).export()

const trim = defineRoot({
	in: "string",
	morphs: (s: string) => s.trim()
})

const uppercase = defineRoot({
	in: "string",
	morphs: (s: string) => s.toUpperCase()
})

const lowercase = defineRoot({
	in: "string",
	morphs: (s: string) => s.toLowerCase()
})

export type formattingExports = {
	trim: (In: string) => Out<string>
	uppercase: (In: string) => Out<string>
	lowercase: (In: string) => Out<string>
	normalize: RootModule<normalization>
}

export type formatting = SchemaModule<formattingExports>

export const formatting: formatting = schemaScope({
	trim,
	uppercase,
	lowercase,
	normalize: normalization
}).export()
