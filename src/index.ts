#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { Lexer } from './lexer/lexer';
import { Parser } from './parser/parser';
import { evaluate } from './evaluator/evaluator';
import { Environment } from './evaluator/environment';
import { Token, TokenType } from './lexer/tokens';

const main = () => {
  // process.argv contains command line arguments.
  // process.argv[0] is usually the path to node executable.
  // process.argv[1] is the path to the script being run (e.g., src/index.ts).
  // The first actual argument starts at process.argv[2].
  const filePathArg = process.argv[2];

  if (!filePathArg) {
    console.error('Error: No file path provided.');
    console.log('Usage: npm run demo <file.rl>');
    process.exit(1);
  }

  // Resolve the path relative to the current working directory
  const resolvedFilePath = path.resolve(process.cwd(), filePathArg);

  try {
    const sourceCode = fs.readFileSync(resolvedFilePath, 'utf-8');

    const lexer = new Lexer(sourceCode);
    let token: Token;
    do {
      token = lexer.nextToken();
      console.log(
        `Type: ${token.type.padEnd(15)}, Literal: "${token.literal
          .replace(/\n/g, '\\n')
          .replace(/\r/g, '\\r')}", Line: ${token.line}, Col: ${token.column}`
      );
    } while (token.type !== TokenType.EOF);
    console.log('--------------\n');

    // const parser = new Parser(lexer);
    // const program = parser.parseProgram();
    // // Print parser errors if any
    // if (parser.errors.length > 0) {
    //   console.error('Parser errors:');
    //   parser.errors.forEach((err) => console.error(err));
    // } else {
    //   const env = new Environment();
    //   evaluate(program, env);
    // }
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      console.error(`Error: File not found at ${resolvedFilePath}`);
    } else {
      console.error('An unexpected error occurred:');
      console.error(error);
    }
    process.exit(1);
  }
};

main();
