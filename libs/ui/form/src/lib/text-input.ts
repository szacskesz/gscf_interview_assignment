import { Directive } from '@angular/core';

@Directive({
  selector: 'input[gscfTextInput]',
  host: {
    class:
      'min-h-11 w-full rounded-md border-2 border-control bg-surface px-3 text-ink placeholder:text-placeholder hover:[&:read-write:not([aria-invalid=true])]:border-control-hover focus:outline-2 focus:outline-primary aria-invalid:border-danger aria-invalid:pe-10 disabled:bg-disabled disabled:placeholder:text-disabled-ink read-only:bg-disabled read-only:placeholder:text-disabled-ink',
  },
})
export class TextInput {}

@Directive({
  selector: 'input[type=radio][gscfRadioInput]',
  host: {
    class:
      'size-4 appearance-none rounded-full border-2 border-control bg-surface align-middle checked:border-[5px] checked:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-danger disabled:bg-disabled',
  },
})
export class RadioInput {}
