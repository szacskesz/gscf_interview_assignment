import { Directive } from '@angular/core';

@Directive({
  selector: 'input[gscfTextInput]',
  host: {
    class:
      'min-h-11 w-full rounded-md border border-control bg-surface px-3 text-ink placeholder:text-placeholder enabled:hover:border-control-hover focus-visible:outline-2 focus-visible:outline-primary aria-invalid:border-danger disabled:bg-disabled',
  },
})
export class TextInput {}

@Directive({
  selector: 'input[type=radio][gscfRadioInput]',
  host: {
    class:
      'size-4 appearance-none rounded-full border border-control bg-surface align-middle checked:border-[5px] checked:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-danger',
  },
})
export class RadioInput {}
