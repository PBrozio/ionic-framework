export interface DatetimeChangeEventDetail {
  value?: string | string[] | null;
}

export interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

export interface DatetimeParts {
  month: number;
  day: number | null;
  year: number;
  dayOfWeek?: number | null;
  hour?: number;
  minute?: number;
  ampm?: 'am' | 'pm';
}

export type DatetimePresentation = 'date-time' | 'time-date' | 'date' | 'time' | 'month' | 'year' | 'month-year';

export type TitleSelectedDatesFormatter = (selectedDates: string[]) => string;

export type DatetimeHighlightStyle = {
  type: DatetimeHighlightType;
};

export enum DatetimeHighlightType {
  entry = 0,
  entryOwnApproval = 1,
  entryApproved = 2,
  entryCanceled = 3
}

export type DatetimeHighlight = { date: string } & DatetimeHighlightStyle;

export type DatetimeHighlightCallback = (dateIsoString: string) => DatetimeHighlightStyle | undefined;

export type VacationDatesCallback = (dateIsoString: string) => string | undefined;

export type DatetimeHourCycle = 'h11' | 'h12' | 'h23' | 'h24';

/**
 * FormatOptions must include date and/or time; it cannot be an empty object
 */
export type FormatOptions =
  | {
      date: Intl.DateTimeFormatOptions;
      time?: Intl.DateTimeFormatOptions;
    }
  | {
      date?: Intl.DateTimeFormatOptions;
      time: Intl.DateTimeFormatOptions;
    };
