import { Directive } from '@angular/core';

@Directive({
  selector: 'input[type=radio][gscfRadioInput]',
  host: {
    class:
      'size-4 appearance-none rounded-full border-2 border-control bg-surface align-middle checked:border-[5px] checked:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary aria-invalid:border-danger disabled:bg-disabled',
  },
})
export class RadioInput {}
