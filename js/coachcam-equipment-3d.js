// Visible, anatomically attached training equipment for CoachCam.
// All positions are in Three.js world metres. The player owns placement and
// chooses which athletes wear equipment; every assigned athlete keeps it on
// while waiting, playing, paused, or scrubbing. No WebGL line-width dependency.
(function () {
  "use strict";

  var RR = window.RR = window.RR || {};
  var EPSILON = 1e-8;

  function positive(value, fallback, minimum) {
    value = Number(value);
    return Number.isFinite(value) && value > 0 ? Math.max(minimum || 0.001, value) : fallback;
  }

  function ownGeometry(geometry) {
    geometry.userData.coachCamOwnedGeometry = true;
    return geometry;
  }

  function ownMaterial(material) {
    material.userData.coachCamOwnedMaterial = true;
    return material;
  }

  function mesh(THREE, geometry, material, name) {
    var result = new THREE.Mesh(ownGeometry(geometry), ownMaterial(material));
    result.name = name;
    // Older player cleanup checks the Mesh; newer cleanup checks Geometry.
    result.userData.coachCamOwnedGeometry = true;
    result.castShadow = true;
    result.receiveShadow = true;
    return result;
  }

  function solidMaterial(THREE, color) {
    return new THREE.MeshStandardMaterial({ color: color, roughness: 0.76, metalness: 0 });
  }

  function disposeGroup(root) {
    var geometries = new Set(), materials = new Set();
    root.traverse(function (object) {
      if (object.geometry && object.geometry.userData.coachCamOwnedGeometry) geometries.add(object.geometry);
      var list = object.material ? (Array.isArray(object.material) ? object.material : [object.material]) : [];
      list.forEach(function (material) {
        if (material.userData.coachCamOwnedMaterial) materials.add(material);
      });
    });
    geometries.forEach(function (geometry) { geometry.dispose(); });
    materials.forEach(function (material) { material.dispose(); });
  }

  // A solid rectangular cross section makes a flat latex/fabric band visible
  // from both the court camera and the close technique camera. Buffer identity
  // is preserved through every update; only its existing vertex data changes.
  function ribbon(THREE, segments, color) {
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array((segments + 1) * 4 * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.getAttribute("position").setUsage(THREE.DynamicDrawUsage);
    var indices = [];
    for (var i = 0; i < segments; i++) {
      for (var edge = 0; edge < 4; edge++) {
        var next = (edge + 1) % 4;
        var a = i * 4 + edge, b = i * 4 + next, c = (i + 1) * 4 + edge, d = (i + 1) * 4 + next;
        indices.push(a, c, b, b, c, d);
      }
    }
    geometry.setIndex(indices);
    var result = mesh(THREE, geometry, solidMaterial(THREE, color), "TensionedBandRibbon");
    result.frustumCulled = false;
    result.userData.crossSection = "flat-ribbon";
    return result;
  }

  function tube(THREE, segments, sides, color) {
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array((segments + 1) * sides * 3), 3));
    geometry.getAttribute("position").setUsage(THREE.DynamicDrawUsage);
    var indices = [];
    for (var i = 0; i < segments; i++) {
      for (var side = 0; side < sides; side++) {
        var next = (side + 1) % sides;
        var a = i * sides + side, b = i * sides + next, c = (i + 1) * sides + side, d = (i + 1) * sides + next;
        indices.push(a, b, c, b, d, c);
      }
    }
    geometry.setIndex(indices);
    var result = mesh(THREE, geometry, solidMaterial(THREE, color), "JumpRopeCord");
    result.frustumCulled = false;
    return result;
  }

  function finishGeometry(object) {
    object.geometry.getAttribute("position").needsUpdate = true;
    object.geometry.computeVertexNormals();
    object.geometry.computeBoundingSphere();
  }

  function createWearable(THREE, kind, options) {
    options = options || {};
    if (["mini bands", "bands", "jump ropes"].indexOf(kind) === -1) {
      throw new Error("Unsupported CoachCam wearable: " + kind);
    }
    var root = new THREE.Group();
    root.name = "WorkingEquipment_" + kind.replace(/\s+/g, "-");
    root.userData.equipmentKind = kind;
    var mini = kind === "mini bands", rope = kind === "jump ropes";
    var anklePlacement = mini && options.placement === "ankles";
    var width = positive(options.width, mini ? (anklePlacement ? 0.045 : 0.055) : 0.032);
    var thickness = positive(options.thickness, mini ? 0.006 : 0.004);
    var color = options.color == null ? (mini ? 0xff571f : rope ? 0xffd43b : 0x1bd6ae) : options.color;
    // Multiples of four and five include both capsule seams and the exact
    // anchored-loop contact point in the reusable vertex buffer.
    var segments = 80, sides = 8;
    var working = rope ? tube(THREE, segments, sides, color) : ribbon(THREE, segments, color);
    root.add(working);
    root.userData.bandWidthMetres = rope ? 0 : width;
    root.userData.placement = mini ? (anklePlacement ? "ankles" : "above-knees") : "hands";

    var left = new THREE.Vector3(), right = new THREE.Vector3();
    var leftUpper = new THREE.Vector3(), rightUpper = new THREE.Vector3();
    var across = new THREE.Vector3(), axis = new THREE.Vector3(), forward = new THREE.Vector3();
    var center = new THREE.Vector3(), point = new THREE.Vector3(), outward = new THREE.Vector3();
    var corner = new THREE.Vector3(), scratch = new THREE.Vector3();
    var tangent = new THREE.Vector3(), binormal = new THREE.Vector3(), ropeOffset = new THREE.Vector3();
    var vertical = new THREE.Vector3(0, 1, 0);
    var bones = {}, lastActorRoot = null;
    var attachmentPoints = [new THREE.Vector3(), new THREE.Vector3()];
    root.userData.attachmentPoints = attachmentPoints;
    var fixedAnchor = null, anchorPost = null;
    var mode = options.mode || "handheld";
    if (options.anchor) {
      fixedAnchor = new THREE.Vector3();
      if (Array.isArray(options.anchor)) fixedAnchor.fromArray(options.anchor);
      else fixedAnchor.copy(options.anchor);
    }
    var anchored = !mini && !rope && /^anchored/.test(mode);
    var handles = [];
    if (rope) {
      ["L", "R"].forEach(function (side) {
        var handle = mesh(THREE, new THREE.CylinderGeometry(0.017, 0.019, 0.105, 10),
          solidMaterial(THREE, 0x173e54), "JumpRopeHandle_" + side);
        root.add(handle);
        handles.push(handle);
      });
    }

    function findBone(actor, name) {
      if (lastActorRoot !== actor.root) { bones = {}; lastActorRoot = actor.root; }
      if (!Object.prototype.hasOwnProperty.call(bones, name)) bones[name] = actor.root.getObjectByName(name) || null;
      return bones[name];
    }

    function joint(actor, name, target) {
      var bone = findBone(actor, "ATH_JOINT_" + name);
      if (!bone) return false;
      bone.getWorldPosition(target);
      return true;
    }

    function grip(actor, side, target) {
      var hand = findBone(actor, "ATH_HAND_" + side);
      if (hand) {
        // The hand bone follows the articulated wrist. Its local Y axis runs
        // from wrist toward the fingers; the middle of the palm holds the prop.
        // Exported segment bones scale local Y by their authored length. Use
        // the normalized world axis so a 15 cm hand bone does not shrink a
        // 6.5 cm palm offset to less than one centimetre at the wrist.
        target.setFromMatrixPosition(hand.matrixWorld);
        scratch.setFromMatrixColumn(hand.matrixWorld, 1).normalize();
        target.addScaledVector(scratch, 0.065);
        return true;
      }
      if (!joint(actor, "WRIST_" + side, target)) return false;
      if (joint(actor, "ELBOW_" + side, scratch)) target.addScaledVector(scratch.sub(target).normalize(), -0.065);
      return true;
    }

    function makeAnchor(actor) {
      if (!fixedAnchor) {
        fixedAnchor = new THREE.Vector3(0, 0, 1.35).applyQuaternion(actor.root.quaternion);
        fixedAnchor.add(actor.home || actor.root.position);
        fixedAnchor.y += mode === "anchored-single" ? 1.7 : 1.35;
      }
      if (options.showAnchor !== false && !anchorPost) {
        var ground = Number(options.floorY) || 0;
        var height = Math.max(0.1, fixedAnchor.y - ground);
        anchorPost = new THREE.Group();
        anchorPost.name = "FixedResistanceBandAnchor";
        anchorPost.position.set(fixedAnchor.x, ground, fixedAnchor.z);
        var post = mesh(THREE, new THREE.CylinderGeometry(0.035, 0.035, height, 12),
          solidMaterial(THREE, 0x576776), "ResistanceBandAnchorPost");
        post.position.y = height / 2;
        anchorPost.add(post);
        var foot = mesh(THREE, new THREE.CylinderGeometry(0.23, 0.25, 0.045, 16),
          solidMaterial(THREE, 0x283848), "ResistanceBandAnchorBase");
        foot.position.y = 0.0225;
        anchorPost.add(foot);
        root.add(anchorPost);
      }
      root.userData.anchorPoint = fixedAnchor;
    }

    function writeRibbonVertex(index, position, normal, bandAxis) {
      var attribute = working.geometry.getAttribute("position");
      for (var c = 0; c < 4; c++) {
        var axialSign = c < 2 ? 1 : -1;
        var radialSign = c === 0 || c === 3 ? 1 : -1;
        corner.copy(position).addScaledVector(bandAxis, axialSign * width / 2)
          .addScaledVector(normal, radialSign * thickness / 2);
        attribute.setXYZ(index * 4 + c, corner.x, corner.y, corner.z);
      }
    }

    function updateMini(actor) {
      if (!joint(actor, anklePlacement ? "ANKLE_L" : "KNEE_L", left) ||
          !joint(actor, anklePlacement ? "ANKLE_R" : "KNEE_R", right) ||
          !joint(actor, anklePlacement ? "KNEE_L" : "HIP_L", leftUpper) ||
          !joint(actor, anklePlacement ? "KNEE_R" : "HIP_R", rightUpper)) return false;
      axis.copy(leftUpper).sub(left).add(rightUpper).sub(right);
      left.lerp(leftUpper, anklePlacement ? 0.18 : 0.24);
      right.lerp(rightUpper, anklePlacement ? 0.18 : 0.24);
      across.copy(right).sub(left);
      if (across.lengthSq() < EPSILON) across.set(1, 0, 0).applyQuaternion(actor.root.quaternion);
      across.normalize();
      axis.addScaledVector(across, -axis.dot(across));
      if (axis.lengthSq() < EPSILON) axis.copy(vertical);
      axis.normalize();
      forward.crossVectors(across, axis).normalize();
      var radius = positive(options.radius, anklePlacement ? 0.078 : 0.106);
      // The capsule wraps the OUTSIDE of each thigh; front/back straight spans
      // stay tensioned instead of an ellipse cutting through the inner legs.
      for (var i = 0; i <= segments; i++) {
        var section = i / segments * 4, t, angle;
        if (section <= 1) {
          angle = Math.PI / 2 - section * Math.PI;
          outward.copy(across).multiplyScalar(Math.cos(angle)).addScaledVector(forward, Math.sin(angle));
          point.copy(right).addScaledVector(outward, radius);
        } else if (section <= 2) {
          t = section - 1;
          outward.copy(forward).negate();
          point.copy(right).lerp(left, t).addScaledVector(outward, radius);
        } else if (section <= 3) {
          angle = -Math.PI / 2 - (section - 2) * Math.PI;
          outward.copy(across).multiplyScalar(Math.cos(angle)).addScaledVector(forward, Math.sin(angle));
          point.copy(left).addScaledVector(outward, radius);
        } else {
          t = section - 3;
          outward.copy(forward);
          point.copy(left).lerp(right, t).addScaledVector(outward, radius);
        }
        writeRibbonVertex(i, point, outward, axis);
      }
      return true;
    }

    function updateBand(actor) {
      if (!grip(actor, "L", left) || !grip(actor, "R", right)) return false;
      if (anchored) makeAnchor(actor);
      across.copy(right).sub(left);
      if (anchored && mode === "anchored-single") {
        if (options.hand === "L") right.copy(left);
        left.copy(fixedAnchor);
      }
      center.copy(left).add(right).multiplyScalar(0.5);
      across.copy(right).sub(left);
      var halfSpan = across.length() / 2;
      if (across.lengthSq() < EPSILON) across.set(1, 0, 0).applyQuaternion(actor.root.quaternion);
      across.normalize();
      forward.set(0, 0, -1).applyQuaternion(actor.root.quaternion);
      forward.addScaledVector(across, -forward.dot(across));
      if (forward.lengthSq() < EPSILON) forward.copy(vertical).addScaledVector(across, -vertical.dot(across));
      forward.normalize();
      axis.crossVectors(forward, across).normalize();
      for (var i = 0; i <= segments; i++) {
        var p = i / segments;
        if (anchored && mode !== "anchored-single") {
          // Closed loop: left palm -> fixed anchor -> right palm -> left palm.
          // The two stretched working limbs demonstrate the actual row setup.
          if (p < 0.4) point.copy(left).lerp(fixedAnchor, p / 0.4);
          else if (p < 0.8) point.copy(fixedAnchor).lerp(right, (p - 0.4) / 0.4);
          else point.copy(right).lerp(left, (p - 0.8) / 0.2);
          outward.copy(forward);
        } else {
          var angle = p * Math.PI * 2;
          point.copy(center).addScaledVector(across, Math.cos(angle) * halfSpan)
            .addScaledVector(forward, Math.sin(angle) * 0.025);
          outward.copy(across).multiplyScalar(Math.cos(angle)).addScaledVector(forward, Math.sin(angle)).normalize();
        }
        writeRibbonVertex(i, point, outward, axis);
      }
      return true;
    }

    function updateRope(actor) {
      if (!grip(actor, "L", left) || !grip(actor, "R", right)) return false;
      center.copy(left).add(right).multiplyScalar(0.5);
      across.copy(right).sub(left);
      if (across.lengthSq() < EPSILON) across.set(0.1, 0, 0).applyQuaternion(actor.root.quaternion);
      forward.set(0, 0, -1).applyQuaternion(actor.root.quaternion);
      var progress = Number(actor.currentProgress) || 0;
      var jumping = actor.currentMotion === "jump-rope";
      // The authored clip has two low hops per cycle; the cord passes beneath
      // the shoes at each hop's peak. Waiting athletes hold a stationary loop.
      var theta = jumping ? 4 * Math.PI * (progress - 0.125) : 0;
      var floor = Number(options.floorY) || 0;
      var hop = jumping ? 0.065 * Math.max(0, Math.sin(4 * Math.PI * progress)) : 0;
      var radius = positive(options.ropeRadius, Math.max(0.1, center.y - floor - hop + (jumping ? 0.05 : -0.02)));
      var cordRadius = positive(options.cordRadius, 0.006);
      ropeOffset.copy(vertical).multiplyScalar(-radius * Math.cos(theta)).addScaledVector(forward, radius * Math.sin(theta));
      binormal.crossVectors(across, ropeOffset).normalize();
      if (binormal.lengthSq() < EPSILON) binormal.copy(forward);
      var attribute = working.geometry.getAttribute("position");
      for (var i = 0; i <= segments; i++) {
        var p = i / segments;
        point.copy(left).lerp(right, p).addScaledVector(ropeOffset, Math.sin(Math.PI * p));
        tangent.copy(across).addScaledVector(ropeOffset, Math.PI * Math.cos(Math.PI * p)).normalize();
        outward.crossVectors(binormal, tangent).normalize();
        for (var c = 0; c < sides; c++) {
          var angle = c / sides * Math.PI * 2;
          corner.copy(point).addScaledVector(outward, Math.cos(angle) * cordRadius)
            .addScaledVector(binormal, Math.sin(angle) * cordRadius);
          attribute.setXYZ(i * sides + c, corner.x, corner.y, corner.z);
        }
      }
      handles[0].position.copy(left);
      handles[1].position.copy(right);
      handles.forEach(function (handle, index) {
        var hand = findBone(actor, "ATH_HAND_" + (index === 0 ? "L" : "R"));
        if (hand) hand.getWorldQuaternion(handle.quaternion);
        else handle.quaternion.copy(actor.root.quaternion);
      });
      return true;
    }

    return {
      root: root,
      update: function (actor) {
        if (!actor || !actor.root) { root.visible = false; return false; }
        actor.root.updateMatrixWorld(true);
        var valid = mini ? updateMini(actor) : rope ? updateRope(actor) : updateBand(actor);
        root.visible = valid;
        if (!valid) return false;
        attachmentPoints[0].copy(left);
        attachmentPoints[1].copy(right);
        finishGeometry(working);
        return true;
      },
      dispose: function () { disposeGroup(root); }
    };
  }

  function createCourtTarget(THREE, options) {
    options = options || {};
    var type = options.type || "zone";
    var root = new THREE.Group();
    root.name = "CourtTarget_" + type;
    root.userData.targetKind = type;
    var color = options.color == null ? 0xffc440 : options.color;
    var width = positive(options.width, 1.5), depth = positive(options.depth, 1.5);
    var radius = positive(options.radius, 0.45);
    if (type === "balloon") {
      var balloonRadius = positive(options.radius, 0.23);
      var balloonColor = options.color == null ? 0x66c8f2 : color;
      var balloon = mesh(THREE, new THREE.SphereGeometry(balloonRadius, 24, 16), solidMaterial(THREE, balloonColor), "TrainingBalloon");
      balloon.scale.y = 1.2;
      root.add(balloon);
      var knot = mesh(THREE, new THREE.ConeGeometry(balloonRadius * .1522, balloonRadius * .2826, 8), solidMaterial(THREE, balloonColor), "BalloonKnot");
      knot.position.y = -balloonRadius * 1.2391;
      root.add(knot);
      // Unscaled ellipsoid dimensions let the player place contact on the
      // balloon surface instead of using a smaller volleyball's clearance.
      root.userData.contactRadius = balloonRadius * 1.2;
      root.userData.contactRadii = { x: balloonRadius, y: balloonRadius * 1.2, z: balloonRadius };
    } else if (type === "agility-ladder" || type === "agility ladder" || type === "ladder") {
      var ladderWidth = positive(options.width, .64);
      // Authored diagram rectangles describe SPACES. Eight 0.5m spaces need
      // nine crossbars; scaling the old prototype silently changed the pitch.
      var spaces = Math.min(64, Math.max(1, Math.round(positive(options.spaces || options.rungs,
        options.depth ? Math.round(depth / .5) : 8, 1))));
      var span = positive(options.depth, spaces * positive(options.rungSpacing, .5));
      var spacing = span / spaces;
      var railWidth = Math.min(.025, ladderWidth / 8);
      var rungDepth = Math.min(.035, spacing / 6);
      var railMaterial = solidMaterial(THREE, 0x15394b);
      var rungMaterial = solidMaterial(THREE, color);
      [-1, 1].forEach(function (side) {
        var rail = mesh(THREE, new THREE.BoxGeometry(railWidth, .004, span + rungDepth), railMaterial,
          "AgilityLadderRail_" + (side < 0 ? "L" : "R"));
        rail.position.set(side * (ladderWidth - railWidth) / 2, .002, 0);
        rail.castShadow = false;
        root.add(rail);
      });
      for (var rungIndex = 0; rungIndex <= spaces; rungIndex++) {
        var rung = mesh(THREE, new THREE.BoxGeometry(ladderWidth, .012, rungDepth), rungMaterial,
          "AgilityLadderRung_" + rungIndex);
        rung.position.set(0, .006, -span / 2 + rungIndex * spacing);
        rung.userData.rungIndex = rungIndex;
        rung.castShadow = false;
        root.add(rung);
      }
      root.userData.rungSpaceCount = spaces;
      root.userData.rungCount = spaces + 1;
      root.userData.rungSpacingMetres = spacing;
      root.userData.nominalLengthMetres = span;
      root.userData.footprint = { width: ladderWidth, depth: span + rungDepth };
    } else if (type === "ball-cart") {
      var frame = solidMaterial(THREE, 0x597184), fabric = solidMaterial(THREE, 0x195d79);
      [-0.32, 0.32].forEach(function (x) {
        [-0.25, 0.25].forEach(function (z) {
          var leg = mesh(THREE, new THREE.CylinderGeometry(0.022, 0.022, 0.83, 8), frame, "BasketLeg");
          leg.position.set(x, 0.46, z); root.add(leg);
          var wheel = mesh(THREE, new THREE.SphereGeometry(0.065, 10, 8), solidMaterial(THREE, 0x20333e), "BasketWheel");
          wheel.position.set(x, 0.065, z); root.add(wheel);
        });
      });
      [[0.69, 0.025, 0.56, 0, .53, 0], [.025, .36, .56, -.345, .71, 0], [.025, .36, .56, .345, .71, 0],
        [.69, .36, .025, 0, .71, -.28], [.69, .36, .025, 0, .71, .28]].forEach(function (p) {
        var panel = mesh(THREE, new THREE.BoxGeometry(p[0], p[1], p[2]), fabric, "BallBasket");
        panel.position.set(p[3], p[4], p[5]); root.add(panel);
      });
      [-.21, 0, .21].forEach(function (x) { [-.12, .12].forEach(function (z) {
        var ball = mesh(THREE, new THREE.SphereGeometry(.105, 16, 10), solidMaterial(THREE, 0xfff7df), "RefillBall");
        ball.position.set(x, .89, z); root.add(ball);
      }); });
      root.userData.footprint = { width: .72, depth: .6 };
    } else if (type === "cone") {
      var coneRadius = positive(options.radius, 0.16);
      var height = positive(options.height, 0.3);
      var base = mesh(THREE, new THREE.CylinderGeometry(coneRadius * 1.12, coneRadius * 1.12, 0.024, 16),
        solidMaterial(THREE, color), "ConeBase");
      base.position.y = 0.012;
      root.add(base);
      var cone = mesh(THREE, new THREE.CylinderGeometry(coneRadius * 0.16, coneRadius, height, 18),
        solidMaterial(THREE, color), "ConeBody");
      cone.position.y = height / 2 + 0.024;
      root.add(cone);
      var stripe = mesh(THREE, new THREE.CylinderGeometry(coneRadius * 0.495, coneRadius * 0.60, height * 0.12, 18),
        solidMaterial(THREE, 0xffffff), "ConeContrastStripe");
      stripe.position.y = height * 0.54 + 0.024;
      root.add(stripe);
      root.userData.footprint = { width: coneRadius * 2.24, depth: coneRadius * 2.24 };
    } else if (type === "hoop" || type === "ring" || options.shape === "circle") {
      var tubeRadius = Math.min(0.026, radius * 0.12);
      var hoop = mesh(THREE, new THREE.TorusGeometry(Math.max(0.01, radius - tubeRadius), tubeRadius, 10, 64),
        solidMaterial(THREE, color), "TargetHoop");
      hoop.rotation.x = -Math.PI / 2;
      hoop.position.y = tubeRadius + 0.005;
      root.add(hoop);
      root.userData.footprint = { width: radius * 2, depth: radius * 2 };
    } else {
      if (!options.boundaryOnly) {
        var fillMaterial = new THREE.MeshBasicMaterial({ color: color, transparent: true,
          opacity: options.opacity == null ? 0.16 : options.opacity, side: THREE.DoubleSide, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
        var fill = mesh(THREE, new THREE.PlaneGeometry(width, depth), fillMaterial, "TargetZoneFill");
        fill.rotation.x = -Math.PI / 2;
        fill.position.y = 0.012;
        fill.castShadow = false;
        root.add(fill);
      }
      var tapeWidth = Math.min(positive(options.tapeWidth, 0.05), width / 4, depth / 4);
      [[width, tapeWidth, 0, (depth - tapeWidth) / 2], [width, tapeWidth, 0, -(depth - tapeWidth) / 2],
        [tapeWidth, depth - tapeWidth * 2, (width - tapeWidth) / 2, 0],
        [tapeWidth, depth - tapeWidth * 2, -(width - tapeWidth) / 2, 0]].forEach(function (side, index) {
        var tape = mesh(THREE, new THREE.BoxGeometry(side[0], 0.004, side[1]),
          solidMaterial(THREE, color), "TargetBoundaryTape_" + index);
        tape.position.set(side[2], 0.017, side[3]);
        tape.castShadow = false;
        root.add(tape);
      });
      root.userData.footprint = { width: width, depth: depth };
    }
    return root;
  }

  RR.coachCamEquipment3D = Object.freeze({
    createWearable: createWearable,
    createCourtTarget: createCourtTarget,
    disposeGroup: disposeGroup
  });
})();
