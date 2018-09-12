export class Photo {

    imgURI: string;
    index: number;
    newPhoto: boolean;

    constructor(_imgURI: string, _index: number, _newPhoto: boolean) {
        this.imgURI = _imgURI;
        this.index = _index;
        this.newPhoto = _newPhoto;
    }

}
