class Camera {
    constructor() {
        this.eye = new Vector3([0, 0, 0]);
        this.at = new Vector3([0, 0, -100]);
        this.up = new Vector3([0, 1, 0]);
    }

    forward() {
        var f = new Vector3;
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        this.eye = this.eye.add(f);
        this.at = this.at.add(f);
    }

    back() {
        var b = new Vector3;
        b.set(this.at);
        b.sub(this.eye);
        b.normalize();
        this.eye = this.eye.sub(f);
        this.at = this.at.sub(f);
    }

    left() {
        var L = new Vector3;
        L.set(this.at);
        L.sub(this.eye);
        L.normalize();
        var s = Vector3.cross(this.up, L);
        this.at.add(s);
        this.eye.add(s);
    }
    
    right() {
        var R = new Vector3;
        R.set(this.at);
        R.sub(this.eye);
        R.normalize();
        var s = Vector3.cross(R, this.up);
        this.at.add(s);
        this.eye.add(s);
    }

    moveUp() {
        this.eye.add(this.up);
    }

    moveDown() {
        this.eye.sub(this.up);
    }

    rotateCameraRight() {
        var atP = new Vector3;
        atP.set(this.at);
        atP.sub(this.eye);
        var r = Math.sqrt(atP.elements[0]*atP.elements[0] + atP.elements[2]*atP.elements[2]);
        var theta = Math.atan2(atP.elements[2], atP.elements[0]);
        theta += (5 * Math.PI / 180);
        atP.elements[0] = r * Math.cos(theta);
        atP.elements[2] = r * Math.sin(theta);
        this.at.set(atP);
        this.at.add(this.eye);
    }

    rotateCameraLeft() {
        var atP = new Vector3;
        atP.set(this.at);
        atP.sub(this.eye);
        var r = Math.sqrt(atP.elements[0]*atP.elements[0] + atP.elements[2]*atP.elements[2]);
        var theta = Math.atan2(atP.elements[2], atP.elements[0]);
        theta -= (5 * Math.PI / 180);
        atP.elements[0] = r * Math.cos(theta);
        atP.elements[2] = r * Math.sin(theta);
        this.at.set(atP);
        this.at.add(this.eye);
    }

    rotateCameraUp() {
        this.at.elements[1] += 5;
    }

    rotateCameraDown() {
        this.at.elements[1] -= 5;
    }
}