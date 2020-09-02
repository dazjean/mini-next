import { BaseController, Result } from '@umajs/core';

export default class Index extends BaseController {

    index() {
        return Result.send('This is index.');
    }
}
