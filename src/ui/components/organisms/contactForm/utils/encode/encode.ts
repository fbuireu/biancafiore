export const encode = (data: Record<string, string>): string => {
    return Object.keys(data)
        .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key].toString())}`)
        .join('&');
};
