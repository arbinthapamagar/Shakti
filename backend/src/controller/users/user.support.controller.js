import { SupportTicket } from '../../models/supportTicket.model.js';
import { apiError } from '../../utils/apiError.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

const createTicket = asyncHandler(async (req, res) => {
    const { subject, category, message, tripId } = req.body;
    if (!subject || !category || !message) {
        throw new apiError(400, 'Subject, category, and message are required');
    }

    const ticket = await SupportTicket.create({
        userId: req.user._id,
        subject,
        category,
        tripId: tripId || null,
        messages: [{ senderId: req.user._id, senderType: 'user', message }],
    });
    return res.status(201).json(new apiResponse(201, ticket, 'Support ticket created'));
});

const getMyTickets = asyncHandler(async (req, res) => {
    const { status } = req.query;
    const filter = { userId: req.user._id };
    if (status) filter.status = status;

    const tickets = await SupportTicket.find(filter)
        .sort({ createdAt: -1 })
        .populate('assignedTo', 'name');
    return res.status(200).json(new apiResponse(200, tickets, 'Tickets fetched'));
});

const getTicketById = asyncHandler(async (req, res) => {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id })
        .populate('assignedTo', 'name');
    if (!ticket) throw new apiError(404, 'Ticket not found');
    return res.status(200).json(new apiResponse(200, ticket, 'Ticket fetched'));
});

const addMessage = asyncHandler(async (req, res) => {
    const { message } = req.body;
    if (!message) throw new apiError(400, 'Message is required');

    const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user._id });
    if (!ticket) throw new apiError(404, 'Ticket not found');
    if (['resolved', 'closed'].includes(ticket.status)) {
        throw new apiError(400, 'Cannot add message to a resolved/closed ticket');
    }

    ticket.messages.push({ senderId: req.user._id, senderType: 'user', message });
    await ticket.save();

    return res.status(200).json(new apiResponse(200, ticket, 'Message added'));
});

export { createTicket, getMyTickets, getTicketById, addMessage };
