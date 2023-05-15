export default function getTime(date) {
    const now = new Date().getTime();
    const post = date.getTime();
    const mspmin = 60 * 1000;
    const msphour = 60 * 60 * 1000;
    const mspday = 24 * 60 * 60 * 1000;
    const mspweek = 7 * 24 * 60 * 60 * 1000;
    const mspmonth = 30 * 24 * 60 * 60 * 1000;
    const mspyear = 365 * 30 * 24 * 60 * 60 * 1000;
    const diff = now - post;

    if (diff / mspyear >= 1) {
        const yearDiff = Math.round(diff / mspyear);
        if (yearDiff === 1) {
            return '1 year ago';
        }
        return `${yearDiff} years ago`;
    } else if (diff / mspmonth >= 1) {
        const monthDiff = Math.round(diff / mspmonth);
        if (monthDiff === 1) {
            return '1 month ago';
        }
        return `${monthDiff} months ago`;
    } else if (diff / mspweek >= 1 ) {
        const weekDiff = Math.round(diff / mspweek);
        if (weekDiff === 1) {
            return '1 week ago';
        }
        return `${weekDiff} weeks ago`;
    } else if (diff / mspday >= 1) {
        const dayDiff = Math.round(diff / mspday);
        if (dayDiff === 1) {
            return '1 day ago';
        }
        return `${dayDiff} days ago`;
    } else if (diff / msphour >= 1) {
        const hourDiff = Math.round(diff / msphour);
        if (hourDiff === 1) {
            return '1 hour ago';
        }
        return `${hourDiff} hours ago`;
    } else {
        const minDiff = Math.round(diff / mspmin);
        if (minDiff <= 5) {
            return 'Now';
        }
        return `${minDiff} minutes ago`;
    }
};