import { Component, OnInit, OnDestroy, inject, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { Store } from '@ngxs/store';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SharedModule, ConfirmationService, MessageService } from 'primeng/api';

import { ContactDetailsDto, UpdateContactDto, CreateContactDto } from '../../models/contact.model';
import { getInitials } from '../../utils/string.utils';
import { ContactsState } from '../../store/contacts.state';
import {
  LoadContactById,
  ClearSelectedContact,
  UpdateContact,
  DeleteContact,
} from '../../store/contacts.actions';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
  selector: 'app-contact-details',
  standalone: true,
  imports: [
    RouterModule,
    ButtonModule,
    CardModule,
    TagModule,
    DialogModule,
    SharedModule,
    ContactFormComponent,
    RouterLink,
  ],
  templateUrl: './contact-details.component.html',
})
export class ContactDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private store = inject(Store);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private id: string | null | undefined;

  contact: Signal<ContactDetailsDto | null> = this.store.selectSignal(
    ContactsState.selectedContact,
  );
  loading: Signal<boolean> = this.store.selectSignal(ContactsState.loading);
  error: Signal<string | null> = this.store.selectSignal(ContactsState.error);

  displayEditDialog = signal(false);

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    if (this.id) {
      this.store.dispatch(new LoadContactById(this.id));
    }
  }

  ngOnDestroy(): void {
    this.store.dispatch(new ClearSelectedContact());
  }

  confirmDelete(contact: ContactDetailsDto): void {
    this.confirmationService.confirm({
      header: 'Delete Contact',
      message: `Are you sure you want to delete "${contact.firstName} ${contact.surname}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.store.dispatch(new DeleteContact(contact.id)).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Contact deleted successfully',
            });
            this.router.navigate(['/contacts']);
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete contact: ' + (err.message || 'Unknown error'),
            });
          },
        });
      },
    });
  }

  handleUpdate(dto: CreateContactDto | UpdateContactDto): void {
    const updatePayload: UpdateContactDto = {
      ...(dto as UpdateContactDto),
    };

    this.store.dispatch(new UpdateContact(this.id ?? '', updatePayload)).subscribe({
      next: () => {
        this.displayEditDialog.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Contact updated successfully',
        });
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update contact: ' + (err.message || 'Unknown error'),
        });
      },
    });
  }

  getInitials(name: string): string {
    return getInitials(name);
  }
}
