/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ScrollFlexWrapper = ({ containerCls, innerCls, rows = 3, children }) => {
  const viewportRef = useRef(null); // the scroller
  const ribbonRef = useRef(null); // the flex content
  const [noOverflow, setNoOverflow] = useState(false);
  const HYSTERESIS = 8;

  const update = () => {
    const vp = viewportRef.current;
    const rb = ribbonRef.current;
    if (!vp || !rb) { return; }

    // measure content width vs viewport width
    const contentW = Math.ceil(rb.scrollWidth); // inner full width
    const viewportW = Math.floor(vp.clientWidth); // visible width

    // apply hysteresis relative to current state
    if (noOverflow) {
      // only switch to overflow if clearly bigger than viewport + buffer
      if (contentW > viewportW + HYSTERESIS) { setNoOverflow(false); }
    } else {
      // only switch to no-overflow if clearly fits with buffer
      if (contentW <= viewportW - HYSTERESIS) { setNoOverflow(true); }
    }
    // setNoOverflow(contentW <= viewportW + 1); // +1 to dodge rounding
  };

  useEffect(() => {
    update();

    // react to resizes of both viewport and ribbon
    const ro = new ResizeObserver(update);
    if (viewportRef.current) { ro.observe(viewportRef.current); }
    if (ribbonRef.current) { ro.observe(ribbonRef.current); }

    // in case fonts/images load later
    window.addEventListener("load", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("load", update);
    };
  }, [children]);

  return (
    <div
      ref={viewportRef}
      className={`${containerCls || "viewport"} ${noOverflow ? "no-overflow" : ""}`}
      style={{ "--rows": rows }}
    >
      <div ref={ribbonRef} className={innerCls || "ribbon"}>
        {children}
      </div>
    </div>
  );
};

ScrollFlexWrapper.propTypes = {
    containerCls: PropTypes.string,
    innerCls: PropTypes.string,
    rows: PropTypes.number
};
export default ScrollFlexWrapper;
