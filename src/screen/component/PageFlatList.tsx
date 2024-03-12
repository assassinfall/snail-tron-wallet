import React, { FC, useEffect, useState, useRef } from 'react';
import { ActivityIndicator, FlatList as RNFlastList, FlatListProps } from 'react-native';
import { Text, View, ViewProps } from 'react-native-ui-lib';
// import { ViewLoader, WidthSpace } from '..';

type IFlatListWithRematchProps<T = any> = FlatListProps<T> & {
  flex?: boolean;
  pageSize?: number; // 每页展示个数
  onEndCB?: () => void; // 每次分页执行的回调
  fetchDataFn: any;
  currentPageNo: number;
  totalCount: number;
  pageToNextFn: any;
  loading: boolean;
  isNeedBigLoading: boolean;
  triggerPageNo: number;
  triggerListType?: string;
};

// 分页组件
const FlatList: FC<IFlatListWithRematchProps> = ({
  flex = true,
  pageSize = 10,
  fetchDataFn, // 接口调用函数,封装为promise，执行.then处理接口返回的数据
  pageToNextFn, // 上滑加载执行的函数
  triggerPageNo, // 用于触发接口调用函数的执行，一旦监听到外部pageNo更新，接口调用函数重新执行
  triggerListType, // 用于页面存在多个tab，在切换tab时，需要分页组件同样监听到外部pageNo更新，接口调用函数重新执行， 如果页面不存在tab则用不到这个参数
  loading,
  isNeedBigLoading = false, //是否在 ViewLoader上面加 loading
  onEndCB, // 上滑加载完成后的额外执行函数
  ...restProps
}) => {
  const [currentPageNo, setCurrentPageNo] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [results, setResults] = useState([]);
  const totalPage = Math.ceil(totalCount / pageSize);
  const flatListRef = useRef<any>();
  useEffect(() => {
    if (triggerPageNo > 0 && totalPage > 0 && triggerPageNo >= totalPage) return;
    fetchDataFn.then((res: { pageNo: number; totalCount: number; results: [] }) => {
      setCurrentPageNo(res.pageNo);
      setTotalCount(res.totalCount);
      setResults(res.results);
      setCurrentPageNo
    });
    // 重新从头开始请求时，页面滚动到顶部
    if (triggerPageNo === 0) {
      flatListRef?.current?.scrollToOffset({ animated: false, offset: 0 });
    }
    return () => {
      console.log('clear');
    };
  }, [triggerPageNo, triggerListType]);


  useEffect(() => {
    // 切换tab时，要求列表上滑到顶部
    if (triggerListType) {
      flatListRef?.current?.scrollToOffset({ animated: true, offset: 0 });
    }
  }, [triggerListType]);

  const onEndReached = () => {
    if (currentPageNo < totalPage) {
      onNext();
      onEndCB && onEndCB();
    }
  };

  const onNext = () => {
    pageToNextFn();
  };

  const emptyComponent = () => {
    if (!loading && totalCount === 0) {
      return (
        <View center padding-30 paddingT-120>
          <Text artTitle grey99>
            暂无更多数据...
          </Text>
        </View>
      );
    }
    return <View />;
  };
  const footerComponent = () => {
    //console.log('footerComponent', currentPageNo, totalPage);
    if (currentPageNo < totalPage || loading)
      //
      return (
        <View row center padding-15>
          <ActivityIndicator size="small" />
          {/* <WidthSpace /> */}
          <Text artTitle grey99>
            正在加载中...
          </Text>
        </View>
      );
    if (currentPageNo === totalPage && currentPageNo !== 0 && totalPage > 0) {
      return (
        <View padding-15 center>
          <Text artTitle grey99>
            没有更多了...
          </Text>
        </View>
      );
    }
    return <View></View>;
  };

  // loading={loading} 不使用View层的loading，分页统一使用分页自己的小loading
  return (
    <RNFlastList
        ref={flatListRef}
        data={results}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.2}
        ListFooterComponent={footerComponent}
        ListEmptyComponent={emptyComponent}
        {...restProps}
      />
  );
};

export const NoData: FC<ViewProps & { title?: string }> = ({
  title = '暂无更多数据...',
  ...restProps
}) => (
  <View center padding-30 {...restProps}>
    <Text artTitle grey99>
      {title}
    </Text>
  </View>
);

export const OnLoad: FC<ViewProps & { title?: string; loading?: boolean }> = ({
  loading = false,
  title = '正在加载中...',
}) => {
  if (loading)
    return (
      <View row center padding-15>
        <ActivityIndicator size="small" />
        {/* <WidthSpace /> */}
        <Text artTitle grey99>
          {title}
        </Text>
      </View>
    );
  return <></>;
};

export default FlatList;