AFRAME.registerSystem("hit-test-system", {
  schema: {
    reticle: { type: "selector" },
    target: { type: "selector" },
  },
  init: function () {
    this.reticle = this.data.reticle;
    this.target = this.data.target;

    this.el.addEventListener("enter-vr", () => {
      this.reticle.setAttribute("visible", "false");
      this.target.setAttribute("visible", "false");

      this.session = this.el.sceneEl.renderer.xr.getSession();
      this.el.sceneEl.renderer.xr.addEventListener(
        "sessionstart",
        async (ev) => {
          this.viewerSpace = await this.session.requestReferenceSpace("viewer");
          this.refSpace = this.el.sceneEl.renderer.xr.getReferenceSpace();
          this.xrHitTestSource = await this.session.requestHitTestSource({
            space: this.viewerSpace,
          });
        }
      );

      this.session.addEventListener("select", (e) => {
        //console.log(e);
        if (!this.reticle.getAttribute("visible")) return;
        this.target.setAttribute("visible", "true");
        this.target.setAttribute(
          "position",
          this.reticle.getAttribute("position")
        );
      });
    });
  },

  tick: function () {
    this.reticle.setAttribute("visible", "false");
    const frame = this.el.sceneEl.frame;
    if (!frame) return;

    const viewerPose = this.el.sceneEl.renderer.xr.getCameraPose();
    if (this.xrHitTestSource && viewerPose) {
      const hitTestResults = frame.getHitTestResults(this.xrHitTestSource);
      if (hitTestResults.length > 0) {
        const hitTestPose = hitTestResults[0].getPose(this.refSpace);
        ["x", "y", "z"].forEach((axis) => {
          this.reticle.object3D.position[axis] =
            hitTestPose.transform.position[axis];
        });
        this.reticle.object3D.quaternion.copy(
          hitTestPose.transform.orientation
        );
        this.reticle.setAttribute("visible", "true");
      }
    }
  },
});
