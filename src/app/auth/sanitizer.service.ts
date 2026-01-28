import { Injectable } from '@angular/core';

import DOMPurify from 'dompurify';



@Injectable({

    providedIn: 'root'

})

export class SanitizerService {

    sanitize(input: string): string {

        return DOMPurify.sanitize(input);

    }

}
