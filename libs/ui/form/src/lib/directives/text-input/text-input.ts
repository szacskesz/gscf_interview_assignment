import { Directive } from '@angular/core';

@Directive({
  selector: 'input[gscfTextInput]',
  host: {
    class:
      'min-h-11 w-full rounded-md border-2 border-control bg-surface px-3 text-ink placeholder:text-placeholder focus:input-focus hover:input-hover aria-invalid:border-danger aria-invalid:pe-10 disabled:bg-disabled disabled:placeholder:text-disabled-ink read-only:bg-disabled read-only:placeholder:text-disabled-ink',
  },
})
export class TextInput {}
