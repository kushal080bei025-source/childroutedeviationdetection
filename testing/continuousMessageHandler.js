// Server-side: Handler for continuous messages
// Add this to your socketIo.js or integrate with your Socket.IO handlers

const continuousMessageHandler = (io, socket) => {
  console.log(`New client connected: ${socket.id}`);

  // Handle continuous messages from clients
  socket.on("continuousMessage", async (message) => {
    try {
      console.log(
        `[${new Date().toLocaleTimeString()}] Received from ${socket.id}:`,
        message,
      );

      // Optional: Save message to database
      // const messageDoc = new MessageModel({
      //   clientId: message.clientId,
      //   text: message.text,
      //   data: message.data,
      //   timestamp: message.timestamp
      // });
      // await messageDoc.save();

      // Send acknowledgment back to client
      socket.emit("messageReceived", {
        success: true,
        messageId: message.id,
        receivedAt: new Date(),
        message: "Message received successfully",
      });

      // Optional: Broadcast to other clients
      // socket.broadcast.emit('newMessage', {
      //   from: socket.id,
      //   message: message.text,
      //   timestamp: message.timestamp
      // });
    } catch (error) {
      console.error("Error processing message:", error);
      socket.emit("messageReceived", {
        success: false,
        error: error.message,
      });
    }
  });

  // Handle client disconnect
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });

  // Handle custom events
  socket.on("error", (error) => {
    console.error(`Socket error for ${socket.id}:`, error);
  });
};

// Alternative: REST API endpoint for continuous messages
const continuousMessageRestHandler = (app) => {
  app.post("/livedata", async (req, res) => {
    try {
      const { message, clientId } = req.body;

      if (!message) {
        return res.status(400).json({
          success: false,
          error: "Message field is required",
        });
      }

      console.log(
        `[${new Date().toLocaleTimeString()}] Received message:`,
        message,
      );

      // Optional: Save to database
      // const messageDoc = new MessageModel({
      //   clientId: clientId,
      //   text: message,
      //   timestamp: new Date()
      // });
      // await messageDoc.save();

      res.status(200).json({
        success: true,
        message: "Message received",
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  });

  // GET endpoint to check status
  app.get("/api/continuous-message/status", (req, res) => {
    res.json({
      status: "running",
      timestamp: new Date(),
    });
  });
};

module.exports = {
  continuousMessageHandler,
  continuousMessageRestHandler,
};
