import { Service, inject } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Service()
export class UiIconSet {
  constructor() {
    const sanitizer = inject(DomSanitizer);
    const iconSet = sanitizer.bypassSecurityTrustResourceUrl('icons.svg');
    inject(MatIconRegistry).addSvgIconSetInNamespace('gscf', iconSet);
  }
}
