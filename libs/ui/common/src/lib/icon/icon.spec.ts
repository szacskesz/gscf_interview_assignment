import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from '@angular/material/icon/testing';
import { expect, it, vi } from 'vitest';
import { Icon } from './icon';

it('registers the shared icon set on first use and reuses it for later icons', async () => {
  TestBed.configureTestingModule({
    providers: [{ provide: MatIconRegistry, useClass: FakeMatIconRegistry }],
  });
  const register = vi.spyOn(TestBed.inject(MatIconRegistry), 'addSvgIconSetInNamespace');
  expect(register).not.toHaveBeenCalled();

  const first = TestBed.createComponent(Icon);
  first.componentRef.setInput('name', 'add');
  await first.whenStable();
  expect(register).toHaveBeenCalledExactlyOnceWith('gscf', expect.anything());

  const second = TestBed.createComponent(Icon);
  second.componentRef.setInput('name', 'remove');
  await second.whenStable();
  expect(register).toHaveBeenCalledTimes(1);
});
