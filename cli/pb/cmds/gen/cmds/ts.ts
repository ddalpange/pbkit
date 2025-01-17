import { Command } from "https://deno.land/x/cliffy@v0.19.5/command/mod.ts";
import {
  createLoader,
  vendorPath,
} from "../../../../../core/loader/deno-fs.ts";
import { build } from "../../../../../core/schema/builder.ts";
import { save } from "../../../../../codegen/index.ts";
import gen from "../../../../../codegen/ts/index.ts";
import expandEntryPaths from "../expandEntryPaths.ts";

interface Options {
  entryPath?: string[];
  protoPath?: string[];
  outDir: string;
  extInImport: string;
}

export default new Command()
  .arguments("[proto-files...:string]")
  .option(
    "--entry-path <dir:string>",
    "Specify the directory containing entry proto files.",
    { collect: true },
  )
  .option(
    "--proto-path <dir:string>",
    "Specify the directory in which to search for imports.",
    { collect: true },
  )
  .option(
    "-o, --out-dir <value:string>",
    "Out directory",
    { default: "out" },
  )
  .option(
    "--ext-in-import <extension:string>",
    "Specify the file extension in import statement.",
    { default: ".ts" },
  )
  .description("Generate typescript library.")
  .action(async (options: Options, protoFiles: string[] = []) => {
    const entryPaths = options.entryPath ?? [];
    const protoPaths = options.protoPath ?? [];
    const roots = [...entryPaths, ...protoPaths, Deno.cwd(), vendorPath];
    const loader = createLoader({ roots });
    const files = [
      ...await expandEntryPaths(entryPaths),
      ...protoFiles,
    ];
    const schema = await build({ loader, files });
    const extInImport = options.extInImport;
    await save(
      options.outDir,
      gen(schema, { extInImport }),
    );
  });
