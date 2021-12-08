function serilizeIP(ip) {
    return ip.replace(/\./g, '').split('').reverse().join('');
}

module.exports = {
    serilizeIP,
};
