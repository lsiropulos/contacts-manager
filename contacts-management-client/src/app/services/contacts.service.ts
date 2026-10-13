import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ContactListDto,
  ContactDetailsDto,
  CreateContactDto,
  UpdateContactDto,
} from '../models/contact.model';
import { environment } from '../../environments/environment';

export interface PaginatedResponse<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ContactsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.baseUrl}/api/contacts`;

  getContacts(
    page: number = 1,
    pageSize: number = 5,
    searchTerm?: string,
  ): Observable<PaginatedResponse<ContactListDto>> {
    let params = new HttpParams().set('page', page.toString()).set('pageSize', pageSize.toString());

    if (searchTerm && searchTerm.trim()) {
      params = params.set('searchTerm', searchTerm.trim());
    }

    return this.http.get<PaginatedResponse<ContactListDto>>(this.apiUrl, { params });
  }

  getContactById(id: string): Observable<ContactDetailsDto> {
    return this.http.get<ContactDetailsDto>(`${this.apiUrl}/${id}`);
  }

  createContact(dto: CreateContactDto): Observable<ContactDetailsDto> {
    return this.http.post<ContactDetailsDto>(this.apiUrl, dto);
  }

  updateContact(id: string, dto: UpdateContactDto): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, dto);
  }

  deleteContact(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
