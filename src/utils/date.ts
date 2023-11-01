export const getCurrentDate = (): string => {
    const today = new Date();
    const month = today.getMonth() < 10 ? `0${today.getMonth()}` : today.getMonth();
    return `${today.getFullYear()}${month}${today.getDate()}`;
};

export const getCurrentDateForNotifications = (): string => {
    const today = new Date();
    const month = today.getMonth() < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
    const day = today.getDate() < 9 ? `0${today.getDate()}` : today.getDate();
    return `${today.getFullYear()}-${month}-${day}T`; // "2011-10-10T14:48:00"
}

export const getNextDayNotification = (): string => {
    const today = new Date(Date.now() + 86400); // 86400 == 24 hours
    const month = today.getMonth() < 10 ? `0${today.getMonth() + 1}` : today.getMonth() + 1;
    const day = (today.getDate()) < 9 ? `0${today.getDate()}` : today.getDate();
    return `${today.getFullYear()}-${month}-${day}T09:00:00`; // "2011-10-10T14:48:00"
}