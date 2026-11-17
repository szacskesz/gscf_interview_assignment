import {
  required,
  requiredError,
  validate,
  type PathKind,
  type SchemaPath,
  type SchemaPathRules,
} from '@angular/forms/signals';

export function requiredNonEmpty<T extends string | null | undefined, K extends PathKind>(
  path: SchemaPath<T, SchemaPathRules.Supported, K>,
  message: string,
): void {
  required(path, { message });
  validate(path, ({ value }) => {
    const text = value();
    return text && text.trim() === '' ? requiredError({ message }) : undefined;
  });
}
