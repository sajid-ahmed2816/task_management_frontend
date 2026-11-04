import { useEffect } from "react";
import PropTypes from "prop-types";

function setDescription(description) {
  let descriptionMeta = document.head.querySelector('meta[name="description"]');

  if (!descriptionMeta) {
    descriptionMeta = document.createElement("meta");
    descriptionMeta.name = "description";
    document.head.appendChild(descriptionMeta);
  }

  descriptionMeta.content = description;
}

export default function PageMetadata({ title, description }) {
  useEffect(() => {
    document.title = `${title} | Flow`;
    setDescription(description);
  }, [title, description]);

  return null;
}

PageMetadata.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
