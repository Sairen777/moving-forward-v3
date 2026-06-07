export type FieldMeta = {
  readonly cols: number;
  readonly rows: number;
  readonly kCool: number;
  readonly chars: string;
  readonly palette: readonly string[];
  readonly generated: string;
  readonly source: string;
  readonly sourceFile: string;
};

export const fieldMeta = {"cols":240,"rows":67,"kCool":4,"chars":" .,:;~=+*oae%#@","palette":["#c4cbc7","#bcc9c8","#b8c6c8","#b6c4c7","#4a2c16","#68401c","#845624","#9f6b2b","#b78133","#c9953b","#d8a848","#e3ba5c","#ecca76","#f4da92"],"generated":"2026.06.06","source":"wheat.jpg","sourceFile":"0x1900-000000-80-0-0.jpg"} as const satisfies FieldMeta;
