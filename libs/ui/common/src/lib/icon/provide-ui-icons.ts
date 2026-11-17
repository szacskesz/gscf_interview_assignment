import { inject, provideEnvironmentInitializer, type EnvironmentProviders } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

export function provideUiIcons(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const sanitizer = inject(DomSanitizer);
    const iconSet = sanitizer.bypassSecurityTrustResourceUrl('icons.svg');
    inject(MatIconRegistry).addSvgIconSetInNamespace('gscf', iconSet);
  });
}
