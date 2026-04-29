"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Candidate = void 0;
var Candidate = /** @class */ (function () {
    function Candidate(props) {
        this.props = props;
    }
    Object.defineProperty(Candidate.prototype, "id", {
        get: function () {
            return this.props.id;
        },
        enumerable: false,
        configurable: true
    });
    return Candidate;
}());
exports.Candidate = Candidate;
