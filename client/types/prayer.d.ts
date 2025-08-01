type PrayerTimes = {
  timings: Timings;
  date: PrayerDate;
  meta: Meta;
};
type Timings = {
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
  [key: string]: string;
};
type PrayerDate = {
  readable: string;
  timestamp: string;
  hijri: Hijri;
  gregorian: Gregorian;
};
type Hijri = {
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
};
type Weekday = {
  en: string;
  ar: string;
};
type Month = {
  number: number;
  en: string;
  ar: string;
  days: number;
};
type Designation = {
  abbreviated: string;
  expanded: string;
};
type Gregorian = {
  date: string;
  format: string;
  day: string;
  weekday: Weekday1;
  month: Month1;
  year: string;
  designation: Designation;
  lunarSighting: boolean;
};
type Weekday1 = {
  en: string;
};
type Month1 = {
  number: number;
  en: string;
};
type Meta = {
  latitude: number;
  longitude: number;
  timezone: string;
  method: Method;
  latitudeAdjustmentMethod: string;
  midnightMode: string;
  school: string;
  offset: Offset;
};
type Method = {
  id: number;
  name: string;
  params: Params;
  location: Location;
};
type Params = {
  Fajr: number;
  Isha: number;
};
type Location = {
  latitude: number;
  longitude: number;
};
type Offset = {
  Imsak: number;
  Fajr: number;
  Sunrise: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Sunset: number;
  Isha: number;
  Midnight: number;
};

type PrayerTimesMonthlyStatsResponse = {
  code: number;
  status: string;
  data: PrayerTimesDataEntity[];
};
type PrayerTimesStatsResponse = {
  code: number;
  status: string;
  data: PrayerTimesDataEntity;
};
type PrayerTimesDataEntity = {
  timings: Timings;
  date: PrayerDate;
  meta: Meta;
};

type Gregorian = {
  date: string;
  format: string;
  day: string;
  weekday: Weekday;
  month: Month;
  year: string;
  designation: Designation;
  lunarSighting: boolean;
};
type Weekday = {
  en: string;
};
type Month = {
  number: number;
  en: string;
};
type Designation = {
  abbreviated: string;
  expanded: string;
};
type Hijri = {
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
};
type Weekday1 = {
  en: string;
  ar: string;
};
type Month1 = {
  number: number;
  en: string;
  ar: string;
  days: number;
};
type Meta = {
  latitude: number;
  longitude: number;
  timezone: string;
  method: Method;
  latitudeAdjustmentMethod: string;
  midnightMode: string;
  school: string;
  offset: Offset;
};
type Method = {
  id: number;
  name: string;
  params: Params;
  location: Location;
};
type Params = {
  Fajr: number;
  Isha: number;
};
type Location = {
  latitude: number;
  longitude: number;
};
type Offset = {
  Imsak: number;
  Fajr: number;
  Sunrise: number;
  Dhuhr: number;
  Asr: number;
  Maghrib: number;
  Sunset: number;
  Isha: number;
  Midnight: number;
};
