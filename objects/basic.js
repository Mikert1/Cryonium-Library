export const basic = {
    name: "Basic v.0.0",
    async imageStatus(imgUrl) {
        try {
            const response = await fetch(imgUrl);
            return response.status === 200;
        } catch (error) {
            return false;
        }
    },
};