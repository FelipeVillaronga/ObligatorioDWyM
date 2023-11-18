import { Injectable } from '@angular/core';
import { IAdmin } from '../interfaces/admin';
import { IProposal } from '../interfaces/proposal';

import { Observable, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { IActivity } from '../interfaces/activity';
import { ActivitiesService } from './activities.service';

@Injectable({
  providedIn: 'root'
})
export class ProposalService {

  private cachedProposal: IProposal | null = null;
  private proposalsUrl = 'http://localhost:3000/api/proposals';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient, private activitiesService: ActivitiesService) { }

  /** GET admin proposals from the server. 
   * 
   * @returns - proposals list of admin found
   */
  getProposals(): Observable<IProposal[]> {
    return this.http.get<IProposal[]>(this.proposalsUrl)
      .pipe(
        tap(_ => console.log('fetched proposals')),
        catchError(this.handleError<IProposal[]>('getProposals', []))
      );
  }

  /** GET proposal by id. Will 404 if id not found 
   * @param id - unique string id
  */
  getProposal(id: string): Observable<IProposal> {
    if (this.cachedProposal && this.cachedProposal.id === id) {
      return of(this.cachedProposal); // Return the cached admin if it matches the requested ID
    } else {
      const url = `${this.proposalsUrl}/${id}`;
      return this.http.get<IProposal>(url).pipe(
        tap(_ => console.log(`fetched proposal id=${id}`)),
        catchError(this.handleError<IProposal>(`getProposal id=${id}`))
      );
    }
  }

  add(name: string, activities: IActivity[]): Observable<IProposal> {
    return this.http.post<IProposal>(this.proposalsUrl, { name, activities }, this.httpOptions).pipe(
      tap((newProposal: IProposal) => console.log(`added proposal w/ id=${newProposal.id}`)),
      catchError(this.handleError<IProposal>('addProposal'))
    );
  }

  /** DELETE
   * 
   * @param admin 
   * @param id 
   * @returns 
   */
  delete(id: string): Observable<boolean> {
    const url = `${this.proposalsUrl}/${id}`;
    return this.http.delete(url).pipe(
      tap(_ => console.log(`deleted proposal id=${id}`)),
      map(() => true), // If the operation is successful, response is mapped into a 'true' boolean
      catchError(this.handleError<boolean>(`deleteProposal id=${id}`))
    );
  }

  /** GET
   * 
   * @param admin 
   * @param proposalId 
   * @param activityId 
   * @returns 
   */
  getActivity(proposalId: string, activityId: number): Observable<IActivity> {
    return this.getProposal(proposalId).pipe(
      tap(_ => console.log(`fetched proposal w/ id=${proposalId}`)),
      switchMap((proposal: IProposal) => {
        const url = `${this.proposalsUrl}/${proposalId}/activities/${activityId}`;
        return this.http.get<IActivity>(url).pipe(
          tap(_ => console.log(`fetched activity '${activityId}' from proposal '${proposalId}'`),
          catchError(this.handleError<IActivity>('getActivity'))
        ));
      }),
    );
  }

  /** GET activity by Id
   * 
   * @param admin 
   * @param proposalId 
   * @param activityId 
   * @returns 
   */
  getActivities(proposalId: string, activityId: number): Observable<IActivity> {
    return this.getProposal(proposalId).pipe(
      tap(_ => console.log(`fetched proposal w/ id=${proposalId}`)),
      switchMap((proposal: IProposal) => {
        const url = `${this.proposalsUrl}/${proposalId}/activities/${activityId}`;
        return this.http.get<IActivity>(url).pipe(
          tap(_ => console.log(`fetched activity '${activityId}' from proposal '${proposalId}'`),
          catchError(this.handleError<IActivity>('getActivity'))
        ));
      }),
    );
  }

  /** POST
   * 
   * @param admin 
   * @param proposalId 
   * @param activityId 
   * @returns 
   */
  addActivity(proposalId: string, activityId: number): Observable<IActivity> {
    return this.getProposal(proposalId).pipe(
      tap(_ => console.log(`fetched proposal w/ id=${proposalId}`)),
      switchMap((proposal: IProposal) => {
        const url = `${this.proposalsUrl}/${proposalId}/activities`;
        return this.http.post<IActivity>(url, activityId, this.httpOptions).pipe(
          tap(_ => console.log(`added activity to proposal: ${activityId}`),
          catchError(this.handleError<IActivity>('addActivity'))
        ));
      }),
    );
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}

