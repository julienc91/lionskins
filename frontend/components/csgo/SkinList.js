import React from "react";
import InfiniteScroll from "react-infinite-scroller";
import { Card, Loader } from "semantic-ui-react";
import Skin from "./Skin";

const SkinList = ({ hasMore, getMoreSkins, loading, skins }) => {
  if (!skins.length) {
    if (loading) {
      return <Loader active inline="centered" />;
    }
    return null;
  }
  return (
    <>
      <InfiniteScroll
        initialLoad={false}
        hasMore={hasMore}
        loadMore={getMoreSkins}
      >
        <Card.Group className="item-list">
          {skins.map((skin) => (
            <Skin key={skin.id} skin={skin} />
          ))}
          <div className="padding-item" />
          <div className="padding-item" />
          <div className="padding-item" />
          <div className="padding-item" />
          <div className="padding-item" />
        </Card.Group>
      </InfiniteScroll>
      {loading && <Loader active inline="centered" key="loader" />}
    </>
  );
};

export default SkinList;
