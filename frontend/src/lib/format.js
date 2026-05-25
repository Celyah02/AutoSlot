export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value || 0));

export const formatNumber = (value) =>
  new Intl.NumberFormat('en-US').format(Number(value || 0));

export const titleCaseRole = (role) => {
  if (!role) {
    return '';
  }

  return role
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};
