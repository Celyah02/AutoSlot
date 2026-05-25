export const toDateTimeLocalValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
};

export const getDefaultReportRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);

  return {
    startDateTime: toDateTimeLocalValue(start),
    endDateTime: toDateTimeLocalValue(now)
  };
};

export const formatDateTime = (value) => {
  if (!value) {
    return '--';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
};
