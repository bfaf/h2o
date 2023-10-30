export const getCurrentDate = (): string => {
    const today = new Date();
    const month = today.getMonth() < 10 ? `0${today.getMonth()}` : today.getMonth();
    return `${today.getFullYear()}${month}${today.getDate()}`;
};
