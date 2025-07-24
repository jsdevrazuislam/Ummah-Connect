
interface PrayerTimes {
    timings: Timings;
    date: PrayerDate;
    meta: Meta;
}
interface Timings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    Firstthird: string;
    Lastthird: string;
    [key: string]: string
}
interface PrayerDate {
    readable: string;
    timestamp: string;
    hijri: Hijri;
    gregorian: Gregorian;
}
interface Hijri {
    date: string;
    format: string;
    day: string;
    weekday: Weekday;
    month: Month;
    year: string;
    designation: Designation;
    holidays?: (null)[] | null;
    adjustedHolidays?: (null)[] | null;
    method: string;
}
interface Weekday {
    en: string;
    ar: string;
}
interface Month {
    number: number;
    en: string;
    ar: string;
    days: number;
}
interface Designation {
    abbreviated: string;
    expanded: string;
}
interface Gregorian {
    date: string;
    format: string;
    day: string;
    weekday: Weekday1;
    month: Month1;
    year: string;
    designation: Designation;
    lunarSighting: boolean;
}
interface Weekday1 {
    en: string;
}
interface Month1 {
    number: number;
    en: string;
}
interface Meta {
    latitude: number;
    longitude: number;
    timezone: string;
    method: Method;
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
    offset: Offset;
}
interface Method {
    id: number;
    name: string;
    params: Params;
    location: Location;
}
interface Params {
    Fajr: number;
    Isha: number;
}
interface Location {
    latitude: number;
    longitude: number;
}
interface Offset {
    Imsak: number;
    Fajr: number;
    Sunrise: number;
    Dhuhr: number;
    Asr: number;
    Maghrib: number;
    Sunset: number;
    Isha: number;
    Midnight: number;
}

interface PrayerTimesMonthlyStatsResponse{
    code: number;
    status: string;
    data: PrayerTimesDataEntity[];
}
interface PrayerTimesStatsResponse {
    code: number;
    status: string;
    data: PrayerTimesDataEntity;
}
interface PrayerTimesDataEntity {
    timings: Timings;
    date: PrayerDate;
    meta: Meta;
}

interface Gregorian {
    date: string;
    format: string;
    day: string;
    weekday: Weekday;
    month: Month;
    year: string;
    designation: Designation;
    lunarSighting: boolean;
}
interface Weekday {
    en: string;
}
interface Month {
    number: number;
    en: string;
}
interface Designation {
    abbreviated: string;
    expanded: string;
}
interface Hijri {
    date: string;
    format: string;
    day: string;
    weekday: Weekday1;
    month: Month1;
    year: string;
    designation: Designation;
    holidays?: (string | null)[] | null;
    adjustedHolidays?: (null)[] | null;
    method: string;
}
interface Weekday1 {
    en: string;
    ar: string;
}
interface Month1 {
    number: number;
    en: string;
    ar: string;
    days: number;
}
interface Meta {
    latitude: number;
    longitude: number;
    timezone: string;
    method: Method;
    latitudeAdjustmentMethod: string;
    midnightMode: string;
    school: string;
    offset: Offset;
}
interface Method {
    id: number;
    name: string;
    params: Params;
    location: Location;
}
interface Params {
    Fajr: number;
    Isha: number;
}
interface Location {
    latitude: number;
    longitude: number;
}
interface Offset {
    Imsak: number;
    Fajr: number;
    Sunrise: number;
    Dhuhr: number;
    Asr: number;
    Maghrib: number;
    Sunset: number;
    Isha: number;
    Midnight: number;
}
