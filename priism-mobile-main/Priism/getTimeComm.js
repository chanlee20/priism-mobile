export default function getTimeComm(date) {
    const now = new Date().getTime();
    const comm = date.getTime();
    const mspmin = 60 * 1000;
    const msphour = 60 * 60 * 1000;
    const mspday = 24 * 60 * 60 * 1000;
    const mspweek = 7 * 24 * 60 * 60 * 1000;
    const mspmonth = 30 * 24 * 60 * 60 * 1000;
    const mspyear = 365 * 30 * 24 * 60 * 60 * 1000;
    const diff = now - comm;

    if (diff / mspyear >= 1) {
        const yearDiff = Math.round(diff / mspyear);
        return `${yearDiff}y`;
    } else if (diff / mspmonth >= 1) {
        const monthDiff = Math.round(diff / mspmonth);
        return `${monthDiff}m`;
    } else if (diff / mspweek >= 1 ) {
        const weekDiff = Math.round(diff / mspweek);
        return `${weekDiff}w`;
    } else if (diff / mspday >= 1) {
        const dayDiff = Math.round(diff / mspday);
        return `${dayDiff}d`;
    } else if (diff / msphour >= 1) {
        const hourDiff = Math.round(diff / msphour);
        return `${hourDiff}h`;
    } else {
        const minDiff = Math.round(diff / mspmin);
        if (minDiff <= 5) {
            return 'Now';
        }
        return `${minDiff}m`;
    }
};