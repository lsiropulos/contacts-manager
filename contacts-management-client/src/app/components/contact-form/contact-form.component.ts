import { Component, EventEmitter, Output, inject, input, effect } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { SharedModule } from 'primeng/api';
import { ContactDetailsDto, CreateContactDto, UpdateContactDto } from '../../models/contact.model';

// Custom Validator: Minimum 16 Years Old
function minimumAgeValidator(minAge: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const dob = control.value instanceof Date ? control.value : new Date(control.value);
    if (isNaN(dob.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age >= minAge ? null : { underAge: { requiredAge: minAge, actualAge: age } };
  };
}

// Custom Validator: Validate dynamic phone numbers array (At least 1, Max 1 Primary)
function phoneNumbersValidator(control: AbstractControl): ValidationErrors | null {
  const formArray = control as FormArray;
  if (!formArray || formArray.length === 0) {
    return { minOnePhoneRequired: true };
  }
  const primaryCount = formArray.controls.filter(
    (group) => group.get('isPrimary')?.value === true,
  ).length;

  if (primaryCount > 1) return { multiplePrimaryPhones: true };

  return null;
}

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    CheckboxModule,
    MessageModule,
    SharedModule,
  ],
  templateUrl: './contact-form.component.html',
})
export class ContactFormComponent {
  private fb = inject(FormBuilder);

  contact = input<ContactDetailsDto | null>(null);
  @Output() formSubmit = new EventEmitter<CreateContactDto | UpdateContactDto>();
  @Output() cancel = new EventEmitter<void>();

  contactForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    surname: ['', [Validators.required, Validators.maxLength(50)]],
    dateOfBirth: [null as Date | string | null, [Validators.required, minimumAgeValidator(16)]],
    address: ['', [Validators.required, Validators.maxLength(200)]],
    iban: ['', [Validators.required]],
    phoneNumbers: this.fb.array([], phoneNumbersValidator),
  });

  get isEditMode(): boolean {
    return !!this.contact()?.id;
  }

  constructor() {
    this.addPhoneNumber(true);

    // Effect to automatically populate the form when the signal input changes
    effect(() => {
      this.populateForm(this.contact());
    });
  }

  private populateForm(contactData: ContactDetailsDto | null): void {
    if (contactData) {
      let dobValue: Date | string = contactData.dateOfBirth;
      if (typeof contactData.dateOfBirth === 'string') {
        const parts = contactData.dateOfBirth.split('-');
        if (parts.length === 3) {
          dobValue = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
      }

      this.contactForm.patchValue({
        firstName: contactData.firstName,
        surname: contactData.surname,
        dateOfBirth: dobValue,
        address: contactData.address,
        iban: contactData.iban,
      });

      this.phoneNumbers.clear();
      if (contactData.phoneNumbers && contactData.phoneNumbers.length > 0) {
        contactData.phoneNumbers.forEach((p) => {
          this.addPhoneNumber(p.isPrimary, p.number, p.id);
        });
      } else {
        this.addPhoneNumber(true);
      }
    } else {
      this.contactForm.reset();
      this.phoneNumbers.clear();
      this.addPhoneNumber(true);
    }
  }

  get phoneNumbers(): FormArray {
    return this.contactForm.get('phoneNumbers') as FormArray;
  }

  addPhoneNumber(isPrimary = false, number = '', id: string = ''): void {
    const phoneGroup = this.fb.group({
      id: [id],
      number: [number, [Validators.required]],
      isPrimary: [isPrimary],
    });
    this.phoneNumbers.push(phoneGroup);
  }

  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 1) {
      const isRemovingPrimary = this.phoneNumbers.at(index).get('isPrimary')?.value;
      this.phoneNumbers.removeAt(index);
      // If we removed the primary phone and there are remaining numbers, make the first one primary
      if (isRemovingPrimary && this.phoneNumbers.length > 0) {
        this.phoneNumbers.at(0).get('isPrimary')?.setValue(true);
      }
      this.phoneNumbers.updateValueAndValidity();
    }
  }

  onPrimaryChange(selectedIndex: number): void {
    const selectedControl = this.phoneNumbers.at(selectedIndex).get('isPrimary');
    const newValue = selectedControl?.value;

    if (newValue) {
      // Uncheck all other controls if this one is being set to primary
      this.phoneNumbers.controls.forEach((control, index) => {
        if (index !== selectedIndex) {
          control.get('isPrimary')?.setValue(false, { emitEvent: false });
        }
      });
    }

    this.phoneNumbers.updateValueAndValidity();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const rawValue = this.contactForm.value;
      const phoneNumbers = (rawValue.phoneNumbers as any[]).map((p) => ({
        id: p.id || null,
        number: p.number.trim(),
        isPrimary: !!p.isPrimary,
      }));

      const contactValue = this.contact();
      if (this.isEditMode && contactValue) {
        const dto: UpdateContactDto = {
          firstName: rawValue.firstName!.trim(),
          surname: rawValue.surname!.trim(),
          dateOfBirth: this.formatDate(rawValue.dateOfBirth),
          address: rawValue.address!.trim(),
          iban: rawValue.iban!.trim(),
          phoneNumbers,
        };
        this.formSubmit.emit(dto);
      } else {
        const dto: CreateContactDto = {
          firstName: rawValue.firstName!.trim(),
          surname: rawValue.surname!.trim(),
          dateOfBirth: this.formatDate(rawValue.dateOfBirth),
          address: rawValue.address!.trim(),
          iban: rawValue.iban!.trim(),
          phoneNumbers,
        };
        this.formSubmit.emit(dto);
      }
    } else {
      this.contactForm.markAllAsTouched();
    }
  }

  private formatDate(dob: any): string {
    if (!dob) return '';
    if (dob instanceof Date) {
      const year = dob.getFullYear();
      const month = String(dob.getMonth() + 1).padStart(2, '0');
      const day = String(dob.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    if (typeof dob === 'string') {
      if (/^\d{4}-\d{2}-\d{2}$/.test(dob)) return dob;
      const parsed = new Date(dob);
      if (!isNaN(parsed.getTime())) {
        const year = parsed.getFullYear();
        const month = String(parsed.getMonth() + 1).padStart(2, '0');
        const day = String(parsed.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
    }
    return String(dob);
  }
}
