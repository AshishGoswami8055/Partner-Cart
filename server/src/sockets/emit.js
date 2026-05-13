let ioRef = null;

export const setIo = (io) => {
  ioRef = io;
};

export const getIo = () => ioRef;

export const emitToUser = (userId, event, payload) => {
  ioRef?.to(`user:${userId}`).emit(event, payload);
};

export const emitToVendor = (vendorId, event, payload) => {
  ioRef?.to(`vendor:${vendorId}`).emit(event, payload);
};

export const emitToConversation = (conversationId, event, payload) => {
  ioRef?.to(`conversation:${conversationId}`).emit(event, payload);
};

export const emitToAdmin = (event, payload) => {
  ioRef?.to('admin').emit(event, payload);
};
