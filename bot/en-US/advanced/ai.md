You may want to use AI tools such as machine learning/deep learning during trading, and banbot provides grpc support for this.

The common process of combining AI is as follows:
1. Define the features on the golang side and start banbot to provide grpc services through `data_server`
2. Request feature data on the python side and save it as training/test data.
3. Train ML/DL and other models on the python side.
4. Deploy the model on the python side to provide grpc prediction services.
5. Implement the trading strategy on the golang side, prepare the feature request model to obtain the prediction results for trading decisions.

banbot has provided a complete golang side [code example](https://github.com/banbox/banstrats/tree/main/rpc_ai) for the above process.
