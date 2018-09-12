export class Prize {
    termsUrl: string;
    _id: string;
}

export class Reward {
    _id: string;

    prize: Prize;
}
